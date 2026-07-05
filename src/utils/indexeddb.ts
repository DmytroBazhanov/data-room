import type {
  DataroomRecord,
  FileMetadata,
  FolderMetadata,
  IndexedDBNode,
} from '@/types/dataroom.ts';

const DB_NAME = 'dataroom-db';
const STORE_NAME = 'datarooms';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['userId', 'dataroomId'] });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStore(db: IDBDatabase, mode: IDBTransactionMode = 'readonly') {
  const transaction = db.transaction(STORE_NAME, mode);
  return transaction.objectStore(STORE_NAME);
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Check if a value is an IndexedDBNode (has metadata, not a Blob). */
function isNode(val: unknown): val is IndexedDBNode {
  return (
    val !== null &&
    typeof val === 'object' &&
    !(val instanceof Blob) &&
    'metadata' in val
  );
}

/** Helper to construct a fullPath correctly. */
function joinPath(parentPath: string, name: string): string {
  if (!parentPath || parentPath === '/') {
    return `/${name}`;
  }
  return `${parentPath}/${name}`;
}

// ---- Public API ----

/** Get a single dataroom record by userId and dataroomId. */
export async function getDataroom(
  userId: string,
  dataroomId: string
): Promise<DataroomRecord | undefined> {
  const db = await openDB();
  const store = getStore(db, 'readonly');
  return promisify(store.get([userId, dataroomId]));
}

/** Get all datarooms for a given user. */
export async function getAllDatarooms(
  userId: string
): Promise<DataroomRecord[]> {
  const db = await openDB();
  const store = getStore(db, 'readonly');
  const all: DataroomRecord[] = await promisify(store.getAll());

  // Filter by userId since the keyPath is composite and getAll returns all.
  return all.filter((record) => record.userId === userId);
}

/** Save (insert or update) a dataroom record. */
export async function putDataroom(record: DataroomRecord): Promise<void> {
  const db = await openDB();
  const store = getStore(db, 'readwrite');
  return promisify(store.put(record));
}

/** Delete a dataroom record. */
export async function deleteDataroom(
  userId: string,
  dataroomId: string
): Promise<void> {
  const db = await openDB();
  const store = getStore(db, 'readwrite');
  await promisify(store.delete([userId, dataroomId]));
}

// ---- Tree Helpers ----

/**
 * Traverse into a dataroom tree by a given path.
 * Path segments are folder names (excluding the root which is the dataroom itself).
 * Returns the node at the end of the path, or undefined if the path doesn't exist.
 */
export function traversePath(
  record: DataroomRecord,
  pathSegments: string[]
): IndexedDBNode | DataroomRecord | undefined {
  let current: DataroomRecord | IndexedDBNode = record;

  for (const segment of pathSegments) {
    const child = Object.values(current).find(
      (val) =>
        isNode(val) &&
        val.metadata.name === segment &&
        val.metadata.type === 'folder'
    ) as IndexedDBNode | undefined;
    if (!child) return undefined;
    current = child;
  }

  return current;
}

/**
 * Get the blob from a file node by its id within a parent node.
 */
export function getFileBlob(
  node: DataroomRecord | IndexedDBNode,
  fileId: string
): Blob | undefined {
  const child = (node as Record<string, unknown>)[fileId];
  if (!isNode(child)) return undefined;
  if (child.metadata.type !== 'file') return undefined;
  return (child as Record<string, unknown>).blob as Blob | undefined;
}

/**
 * Get direct children (folders and files) of a given node.
 * Returns folders first, then files.
 */
export function getChildren(node: DataroomRecord | IndexedDBNode): {
  folders: FolderMetadata[];
  files: FileMetadata[];
} {
  const folders: FolderMetadata[] = [];
  const files: FileMetadata[] = [];

  for (const value of Object.values(node)) {
    if (isNode(value)) {
      if (value.metadata.type === 'folder') {
        folders.push(value.metadata as FolderMetadata);
      } else if (value.metadata.type === 'file') {
        files.push(value.metadata as FileMetadata);
      }
    }
  }

  return { folders, files };
}

/**
 * Create a child entity (folder or file) in the given parent node.
 * Returns true if the entity was created, false if a child with that name already exists.
 */
export function createChildEntity(
  parent: DataroomRecord | IndexedDBNode,
  metadata: FolderMetadata | FileMetadata,
  blob?: Blob
): boolean {
  const existing = Object.values(parent).some(
    (val) => isNode(val) && val.metadata.name === metadata.name
  );
  if (existing) return false;

  const childNode: IndexedDBNode = {
    metadata: { ...metadata },
  };

  if (metadata.type === 'file') {
    (childNode as Record<string, unknown>).blob = blob ?? new Blob([]);
  }

  (parent as Record<string, unknown>)[metadata.id] = childNode;
  return true;
}

/**
 * Rename a child entity in the given parent node.
 * Returns true if renamed, false if the target name already exists.
 */
export function renameChildEntity(
  parent: DataroomRecord | IndexedDBNode,
  childId: string,
  newName: string
): boolean {
  const childVal = (parent as Record<string, unknown>)[childId];
  if (!isNode(childVal)) return false;

  const node = childVal;

  // Check for name collision
  const collides = Object.values(parent).some(
    (val) =>
      isNode(val) &&
      val.metadata.name === newName &&
      val.metadata.id !== childId
  );
  if (collides) return false;

  node.metadata.name = newName;
  node.metadata.updatedAt = new Date();

  // Update fullPath
  const parentPath = parent.metadata.fullPath ?? '';
  node.metadata.fullPath = joinPath(parentPath, newName);

  return true;
}

/**
 * Delete a child entity from the given parent node.
 * Returns true if the child existed and was removed.
 */
export function deleteChildEntity(
  parent: DataroomRecord | IndexedDBNode,
  childId: string
): boolean {
  if (!(childId in parent)) return false;
  delete (parent as Record<string, unknown>)[childId];
  return true;
}
