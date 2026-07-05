export interface BaseMetadata {
  id: string;
  name: string;
  fullPath: string;
  type: 'folder' | 'file';
  parentId: string | null; // null for root (dataroom itself)
  dataroomId: string; // same as id if this is the dataroom root
  createdAt: Date;
  updatedAt: Date;
}

export interface FileMetadata extends BaseMetadata {
  type: 'file';
  size: number;
  mimeType: string;
}

export type FolderMetadata = BaseMetadata;

export type EntityMetadata = FolderMetadata | FileMetadata;

/** A node in the IndexedDB tree. Folders contain children; files contain a blob. */
export interface IndexedDBNode {
  metadata: EntityMetadata;
  // children are keyed by their id
  [childId: string]: IndexedDBNode | Blob | EntityMetadata;
}

export interface DataroomRecord {
  userId: string; // required for IndexedDB composite keyPath
  dataroomId: string; // required for IndexedDB composite keyPath
  metadata: FolderMetadata; // the dataroom root metadata
  // children keyed by id — folders and files
  [childId: string]: IndexedDBNode | Blob | FolderMetadata | string | undefined;
}
