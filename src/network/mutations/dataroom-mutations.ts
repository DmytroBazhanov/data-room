import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FileMetadata, FolderMetadata } from '@/types/dataroom.ts';
import {
  createDataroom,
  renameDataroom,
  removeDataroom,
  createEntity,
  createEntities,
  renameEntity,
  deleteEntity,
  deleteEntities,
} from '@/network/api/dataroom-api.ts';

const DATAROOMS_KEY = 'datarooms';
const DATAROOM_CONTENTS_KEY = 'dataroom-contents';

/** Create a new dataroom. */
export function useCreateDataroom(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createDataroom(userId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DATAROOMS_KEY] });
    },
  });
}

/** Create multiple entities (files/folders) in a single atomic write. */
export function useCreateEntities(
  userId: string | undefined,
  dataroomId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentPath,
      entities,
    }: {
      parentPath: string | null;
      entities: { metadata: FolderMetadata | FileMetadata; blob?: Blob }[];
    }) => createEntities(userId!, dataroomId!, parentPath, entities),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DATAROOM_CONTENTS_KEY],
      });
    },
  });
}

/** Rename a dataroom. */
export function useRenameDataroom(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dataroomId,
      newName,
    }: {
      dataroomId: string;
      newName: string;
    }) => renameDataroom(userId!, dataroomId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DATAROOMS_KEY] });
    },
  });
}

/** Delete a dataroom. */
export function useDeleteDataroom(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataroomId: string) => removeDataroom(userId!, dataroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DATAROOMS_KEY] });
    },
  });
}

/** Create a folder or file inside a dataroom. */
export function useCreateEntity(
  userId: string | undefined,
  dataroomId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentPath,
      metadata,
      blob,
    }: {
      parentPath: string | null;
      metadata: FolderMetadata | FileMetadata;
      blob?: Blob;
    }) => createEntity(userId!, dataroomId!, parentPath, metadata, blob),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DATAROOM_CONTENTS_KEY],
      });
    },
  });
}

/** Rename an entity inside a dataroom. */
export function useRenameEntity(
  userId: string | undefined,
  dataroomId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentPath,
      entityId,
      newName,
    }: {
      parentPath: string | null;
      entityId: string;
      newName: string;
    }) => renameEntity(userId!, dataroomId!, parentPath, entityId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DATAROOM_CONTENTS_KEY],
      });
    },
  });
}

/** Delete multiple entities (files/folders) in a single atomic write. */
export function useDeleteEntities(
  userId: string | undefined,
  dataroomId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentPath,
      entityIds,
    }: {
      parentPath: string | null;
      entityIds: string[];
    }) => deleteEntities(userId!, dataroomId!, parentPath, entityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DATAROOM_CONTENTS_KEY],
      });
    },
  });
}

/** Delete an entity inside a dataroom. */
export function useDeleteEntity(
  userId: string | undefined,
  dataroomId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentPath,
      entityId,
    }: {
      parentPath: string | null;
      entityId: string;
    }) => deleteEntity(userId!, dataroomId!, parentPath, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DATAROOM_CONTENTS_KEY],
      });
    },
  });
}
