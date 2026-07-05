import type {
  DataroomRecord,
  FileMetadata,
  FolderMetadata,
} from '@/types/dataroom.ts';
import {
  getDataroom,
  getAllDatarooms,
  putDataroom,
  deleteDataroom,
  traversePath,
  getChildren,
  getFileBlob,
  createChildEntity,
  renameChildEntity,
  deleteChildEntity,
} from '@/utils/indexeddb.ts';

// ---- Dataroom-level operations ----

/** Fetch all datarooms for a user. */
export async function fetchDatarooms(
  userId: string
): Promise<FolderMetadata[]> {
  const records = await getAllDatarooms(userId);
  return records
    .filter(
      (r) =>
        r.metadata.parentId === null && r.metadata.id === r.metadata.dataroomId
    )
    .map((r) => r.metadata);
}

/** Fetch contents (folders and files) at a given path within a dataroom. */
export async function fetchDataroomContents(
  userId: string,
  dataroomId: string,
  folderPath?: string
): Promise<{ folders: FolderMetadata[]; files: FileMetadata[] } | null> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return null;

  const pathSegments = folderPath ? folderPath.split('/').filter(Boolean) : [];
  const node =
    pathSegments.length > 0 ? traversePath(record, pathSegments) : record;

  if (!node) return null;

  return getChildren(node);
}

/** Fetch a file's blob from a dataroom. */
export async function fetchFileBlob(
  userId: string,
  dataroomId: string,
  parentPath: string | null,
  fileId: string
): Promise<Blob | null> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return null;

  const pathSegments = parentPath ? parentPath.split('/').filter(Boolean) : [];
  const parent =
    pathSegments.length > 0 ? traversePath(record, pathSegments) : record;

  if (!parent) return null;

  return getFileBlob(parent, fileId) ?? null;
}

// ---- CRUD: Dataroom ----

/** Create a new dataroom for the user. Uses name as the ID — no duplicates allowed. */
export async function createDataroom(
  userId: string,
  name: string
): Promise<DataroomRecord> {
  // Check for duplicate name
  const existing = await getDataroom(userId, name);
  if (existing) {
    throw new Error(`A dataroom named "${name}" already exists.`);
  }

  const now = new Date();

  const record: DataroomRecord = {
    userId,
    dataroomId: name,
    metadata: {
      id: name,
      name,
      fullPath: `/${name}`,
      type: 'folder',
      parentId: null,
      dataroomId: name,
      createdAt: now,
      updatedAt: now,
    },
  };

  await putDataroom(record);
  return record;
}

/** Rename a dataroom. Since ID equals name, this deletes the old record and creates a new one. */
export async function renameDataroom(
  userId: string,
  dataroomId: string,
  newName: string
): Promise<DataroomRecord | null> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return null;

  // Check for duplicate name
  const existing = await getDataroom(userId, newName);
  if (existing) {
    throw new Error(`A dataroom named "${newName}" already exists.`);
  }

  // Update metadata in-place
  record.metadata.name = newName;
  record.metadata.fullPath = `/${newName}`;
  record.metadata.updatedAt = new Date();

  // Remove old key, insert under new key
  await deleteDataroom(userId, dataroomId);

  const newRecord: DataroomRecord = {
    ...record,
    dataroomId: newName,
    metadata: {
      ...record.metadata,
      id: newName,
      dataroomId: newName,
    },
  };

  await putDataroom(newRecord);
  return newRecord;
}

/** Delete a dataroom. */
export async function removeDataroom(
  userId: string,
  dataroomId: string
): Promise<void> {
  await deleteDataroom(userId, dataroomId);
}

// ---- CRUD: Folder / File inside a dataroom ----

/** Create a folder or file inside a dataroom at a given path. */
export async function createEntity(
  userId: string,
  dataroomId: string,
  parentPath: string | null,
  metadata: FolderMetadata | FileMetadata,
  blob?: Blob
): Promise<boolean> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return false;

  const pathSegments = parentPath ? parentPath.split('/').filter(Boolean) : [];
  const parent =
    pathSegments.length > 0 ? traversePath(record, pathSegments) : record;

  if (!parent) return false;

  const created = createChildEntity(parent, metadata, blob);
  if (created) {
    await putDataroom(record);
  }
  return created;
}

/** Rename an entity (folder or file) inside a dataroom. */
export async function renameEntity(
  userId: string,
  dataroomId: string,
  parentPath: string | null,
  entityId: string,
  newName: string
): Promise<boolean> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return false;

  const pathSegments = parentPath ? parentPath.split('/').filter(Boolean) : [];
  const parent =
    pathSegments.length > 0 ? traversePath(record, pathSegments) : record;

  if (!parent) return false;

  const renamed = renameChildEntity(parent, entityId, newName);
  if (renamed) {
    await putDataroom(record);
  }
  return renamed;
}

/** Delete an entity (folder or file) inside a dataroom. */
export async function deleteEntity(
  userId: string,
  dataroomId: string,
  parentPath: string | null,
  entityId: string
): Promise<boolean> {
  const record = await getDataroom(userId, dataroomId);
  if (!record) return false;

  const pathSegments = parentPath ? parentPath.split('/').filter(Boolean) : [];
  const parent =
    pathSegments.length > 0 ? traversePath(record, pathSegments) : record;

  if (!parent) return false;

  const deleted = deleteChildEntity(parent, entityId);
  if (deleted) {
    await putDataroom(record);
  }
  return deleted;
}
