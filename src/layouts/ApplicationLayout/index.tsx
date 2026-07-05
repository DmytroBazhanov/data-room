import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  useRenameEntity,
  useDeleteEntity,
} from '@/network/mutations/dataroom-mutations.ts';
import type { FolderMetadata, FileMetadata } from '@/types/dataroom.ts';

export function ApplicationLayout() {
  const { user } = useUser();
  const userId = user?.id;
  const { pathname } = useLocation();

  // Dataroom selection is state-based (not in URL)
  const [selectedDataroomId, setSelectedDataroomId] = useState<string | null>(
    null
  );

  // Derive folder path from URL (everything after the leading /)
  const folderPath = useMemo(() => {
    const cleaned = pathname === '/' ? '' : pathname;
    return cleaned || null;
  }, [pathname]);

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
  const renameEntityMutation = useRenameEntity(
    userId,
    selectedDataroomId ?? undefined
  );
  const deleteEntityMutation = useDeleteEntity(
    userId,
    selectedDataroomId ?? undefined
  );

  // ---- Dataroom callbacks ----

  const handleSelectDataroom = useCallback((id: string) => {
    setSelectedDataroomId(id);
  }, []);

  const handleCreateDataroom = useCallback(
    (name: string) => {
      createDataroomMutation.mutate(name);
    },
    [createDataroomMutation]
  );

  const handleRenameDataroom = useCallback(
    (id: string, newName: string) => {
      renameDataroomMutation.mutate({ dataroomId: id, newName });
    },
    [renameDataroomMutation]
  );

  const handleDeleteDataroom = useCallback(
    (id: string) => {
      deleteDataroomMutation.mutate(id);
      if (selectedDataroomId === id) {
        setSelectedDataroomId(null);
      }
    },
    [deleteDataroomMutation, selectedDataroomId]
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

  // Upload files — extracts metadata from File objects
  const handleUploadFiles = useCallback(
    (files: File[]) => {
      if (!selectedDataroomId) return;

      for (const file of files) {
        const id = crypto.randomUUID();
        const now = new Date();
        const parentPath = folderPath ?? '';
        const fullPath = parentPath
          ? `${parentPath}/${file.name}`
          : `/${file.name}`;

        const metadata: FileMetadata = {
          id,
          name: file.name,
          fullPath,
          type: 'file',
          parentId: null,
          dataroomId: selectedDataroomId,
          createdAt: now,
          updatedAt: now,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
        };

        createEntityMutation.mutate({
          parentPath: folderPath,
          metadata,
          blob: file,
        });
      }
    },
    [selectedDataroomId, folderPath, createEntityMutation]
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

  const handleDeleteEntity = useCallback(
    (entityId: string) => {
      deleteEntityMutation.mutate({
        parentPath: folderPath,
        entityId,
      });
    },
    [folderPath, deleteEntityMutation]
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
                onCreate={handleCreateFolder}
                onRename={handleRenameEntity}
                onDelete={handleDeleteEntity}
              />
              <EntityContainer
                entities={files}
                entityType="file"
                dataroomId={selectedDataroomId}
                onUploadFiles={handleUploadFiles}
                onRename={handleRenameEntity}
                onDelete={handleDeleteEntity}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
