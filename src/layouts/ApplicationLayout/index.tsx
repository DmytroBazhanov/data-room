import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ApplicationSidebar } from '@/components/custom/Sidebar.tsx';
import { ApplicationSearch } from '@/components/custom/Search.tsx';
import { FolderCrumbs } from '@/components/custom/FolderCrumbs.tsx';
import { EntityContainer } from '@/components/custom/EntityContainer.tsx';
import {
  useDatarooms,
  useDataroomContents,
} from '@/network/queries/dataroom-queries.ts';
import {
  useCreateDataroom,
  useRenameDataroom,
  useDeleteDataroom,
  useCreateEntity,
  useCreateEntities,
  useRenameEntity,
  useDeleteEntities,
} from '@/network/mutations/dataroom-mutations.ts';
import type { FolderMetadata, FileMetadata } from '@/types/dataroom.ts';

export function ApplicationLayout() {
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();
  const params = useParams<{ roomId: string; '*': string }>();
  const selectedDataroomId: string | null = params.roomId ?? null;
  // Splat captures everything after /:roomId/ — already decoded by react-router
  const folderPath: string | null =
    params['*'] && params['*'].length > 0 ? `/${params['*']}` : null;

  // Queries
  const { data: datarooms = [] } = useDatarooms(userId);
  const { data: contents, isLoading: contentsLoading } = useDataroomContents(
    userId,
    selectedDataroomId ?? undefined,
    folderPath ?? undefined
  );

  // Mutations — dataroom level
  const createDataroomMutation = useCreateDataroom(userId);
  const renameDataroomMutation = useRenameDataroom(userId);
  const deleteDataroomMutation = useDeleteDataroom(userId);

  // Mutations — entity level
  const createEntityMutation = useCreateEntity(
    userId,
    selectedDataroomId ?? undefined
  );
  const createEntitiesMutation = useCreateEntities(
    userId,
    selectedDataroomId ?? undefined
  );
  const renameEntityMutation = useRenameEntity(
    userId,
    selectedDataroomId ?? undefined
  );
  const deleteEntitiesMutation = useDeleteEntities(
    userId,
    selectedDataroomId ?? undefined
  );

  // ---- Dataroom callbacks ----

  const handleSelectDataroom = useCallback(
    (id: string) => {
      navigate(`/${encodeURIComponent(id)}`, { replace: true });
    },
    [navigate]
  );

  const handleCreateDataroom = useCallback(
    (name: string) => {
      createDataroomMutation.mutate(name);
    },
    [createDataroomMutation]
  );

  const handleRenameDataroom = useCallback(
    (id: string, newName: string) => {
      renameDataroomMutation.mutate(
        { dataroomId: id, newName },
        {
          onSuccess: () => {
            // If the renamed dataroom is the currently selected one, redirect to new name
            if (selectedDataroomId === id) {
              navigate(`/${encodeURIComponent(newName)}`, { replace: true });
            }
          },
        }
      );
    },
    [renameDataroomMutation, selectedDataroomId, navigate]
  );

  const handleDeleteDataroom = useCallback(
    (id: string) => {
      deleteDataroomMutation.mutate(id);
      if (selectedDataroomId === id) {
        navigate('/', { replace: true });
      }
    },
    [deleteDataroomMutation, selectedDataroomId, navigate]
  );

  // ---- Entity callbacks ----

  // Create folder
  const handleCreateFolder = useCallback(
    (name: string) => {
      if (!selectedDataroomId) return;

      const id = crypto.randomUUID();
      const now = new Date();
      const parentPath = folderPath ?? '';
      const fullPath = parentPath ? `${parentPath}/${name}` : `/${name}`;

      const metadata: FolderMetadata = {
        id,
        name,
        fullPath,
        type: 'folder',
        parentId: null,
        dataroomId: selectedDataroomId,
        createdAt: now,
        updatedAt: now,
      };

      createEntityMutation.mutate({ parentPath: folderPath, metadata });
    },
    [selectedDataroomId, folderPath, createEntityMutation]
  );

  // Upload files — extracts metadata from File objects, batches into one atomic write.
  // Resolves name collisions against existing entities by appending (1), (2), etc.
  const handleUploadFiles = useCallback(
    (files: File[]) => {
      if (!selectedDataroomId || files.length === 0) return;

      // Collect existing names from current folder contents
      const existingNames = new Set<string>();
      for (const f of contents?.folders ?? []) existingNames.add(f.name);
      for (const f of contents?.files ?? []) existingNames.add(f.name);

      // Track names generated in this batch to avoid clashes within the batch
      const batchNames = new Set<string>();

      const entities = files.map((file) => {
        const id = crypto.randomUUID();
        const now = new Date();

        // Resolve name collisions: append (N) until unique
        const lastDot = file.name.lastIndexOf('.');
        const baseName = lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
        const ext = lastDot > 0 ? file.name.slice(lastDot) : '';

        let finalName = file.name;
        let counter = 1;
        while (existingNames.has(finalName) || batchNames.has(finalName)) {
          finalName = `${baseName} (${counter})${ext}`;
          counter++;
        }
        batchNames.add(finalName);
        existingNames.add(finalName);

        const parentPath = folderPath ?? '';
        const fullPath = parentPath
          ? `${parentPath}/${finalName}`
          : `/${finalName}`;

        const metadata: FileMetadata = {
          id,
          name: finalName,
          fullPath,
          type: 'file',
          parentId: null,
          dataroomId: selectedDataroomId,
          createdAt: now,
          updatedAt: now,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
        };

        return { metadata, blob: file };
      });

      createEntitiesMutation.mutate({ parentPath: folderPath, entities });
    },
    [selectedDataroomId, folderPath, contents, createEntitiesMutation]
  );

  const handleRenameEntity = useCallback(
    (entityId: string, newName: string) => {
      renameEntityMutation.mutate({
        parentPath: folderPath,
        entityId,
        newName,
      });
    },
    [folderPath, renameEntityMutation]
  );

  const handleDeleteEntities = useCallback(
    (entityIds: string[]) => {
      if (entityIds.length === 0) return;
      deleteEntitiesMutation.mutate({
        parentPath: folderPath,
        entityIds,
      });
    },
    [folderPath, deleteEntitiesMutation]
  );

  const folders: FolderMetadata[] = contents?.folders ?? [];
  const files: FileMetadata[] = contents?.files ?? [];

  return (
    <div className="flex h-screen flex-row overflow-hidden">
      <ApplicationSidebar
        datarooms={datarooms}
        selectedDataroomId={selectedDataroomId}
        onSelectDataroom={handleSelectDataroom}
        onCreateDataroom={handleCreateDataroom}
        onRenameDataroom={handleRenameDataroom}
        onDeleteDataroom={handleDeleteDataroom}
      />

      <div className="flex flex-col h-full min-w-0 grow-1 w-full px-2">
        <ApplicationSearch />
        <div className="pt-2">
          <FolderCrumbs />
        </div>
        <main className="mx-auto max-h-[calc(100vh-72px)] w-full flex-1 overflow-y-auto py-4">
          {!selectedDataroomId ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-lg">
                Select a dataroom from the sidebar to get started.
              </p>
            </div>
          ) : contentsLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading contents...</p>
            </div>
          ) : (
            <>
              <EntityContainer
                entities={folders}
                entityType="folder"
                dataroomId={selectedDataroomId}
                userId={userId}
                parentPath={folderPath}
                onCreate={handleCreateFolder}
                onRename={handleRenameEntity}
                onDelete={handleDeleteEntities}
              />
              <EntityContainer
                entities={files}
                entityType="file"
                dataroomId={selectedDataroomId}
                userId={userId}
                parentPath={folderPath}
                onUploadFiles={handleUploadFiles}
                onRename={handleRenameEntity}
                onDelete={handleDeleteEntities}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
