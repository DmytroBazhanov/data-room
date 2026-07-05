import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Entity } from '@/components/custom/Entity.tsx';
import { EntityControls } from '@/components/custom/EntityControls.tsx';
import { NameDialog } from '@/components/custom/dialogs/NameDialog.tsx';
import { ConfirmDialog } from '@/components/custom/dialogs/ConfirmDialog.tsx';
import { FileUploadDialog } from '@/components/custom/dialogs/FileUploadDialog.tsx';
import { FilePreviewDialog } from '@/components/custom/dialogs/FilePreviewDialog.tsx';
import type { EntityMetadata, FileMetadata } from '@/types/dataroom.ts';

type EntityType = 'folder' | 'file';

interface EntityContainerProps {
  entities: EntityMetadata[];
  entityType: EntityType;
  dataroomId: string;
  userId?: string;
  parentPath: string | null;
  onCreate?: (name: string) => void;
  onUploadFiles?: (files: File[]) => void;
  onRename?: (entityId: string, newName: string) => void;
  onDelete?: (entityId: string) => void;
}

export function EntityContainer({
  entities,
  entityType,
  dataroomId,
  userId,
  parentPath,
  onCreate,
  onUploadFiles,
  onRename,
  onDelete,
}: EntityContainerProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[] | null>(null);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);

  const selectedCount = Object.keys(selectedMap).length;

  // Helper to build navigation path correctly (avoid double slash at root)
  // Encodes the target name to handle spaces and special characters safely in the URL
  const buildNavPath = useCallback(
    (target: string) => {
      const encoded = encodeURIComponent(target);
      if (pathname === '/' || !pathname) {
        return `/${encoded}`;
      }
      return `${pathname}/${encoded}`;
    },
    [pathname]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const getSelectedIds = useCallback((): string[] => {
    return Object.keys(selectedMap);
  }, [selectedMap]);

  const getSelectedEntity = useCallback((): EntityMetadata | undefined => {
    const ids = getSelectedIds();
    return entities.find((e) => ids.includes(e.id));
  }, [getSelectedIds, entities]);

  // Create (folder) / Upload (file)
  const handleCreateClick = useCallback(() => {
    if (entityType === 'folder') {
      setCreateOpen(true);
    } else {
      setUploadOpen(true);
    }
  }, [entityType]);

  const handleCreateConfirm = useCallback(
    (name: string) => {
      onCreate?.(name);
      setCreateOpen(false);
    },
    [onCreate]
  );

  const handleUploadConfirm = useCallback(
    (files: File[]) => {
      onUploadFiles?.(files);
      setUploadOpen(false);
    },
    [onUploadFiles]
  );

  // Name existence check for create dialog
  const nameExists = useCallback(
    (name: string) =>
      entities.some((e) => e.name.toLowerCase() === name.toLowerCase()),
    [entities]
  );

  // Rename
  const handleRenameClick = useCallback(() => {
    const selectedEntity = getSelectedEntity();
    if (!selectedEntity) return;
    setRenameTargetId(selectedEntity.id);
    setSelectedMap({});
  }, [getSelectedEntity]);

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (renameTargetId) {
        onRename?.(renameTargetId, newName);
      }
      setRenameTargetId(null);
    },
    [renameTargetId, onRename]
  );

  const selectedEntity = renameTargetId
    ? entities.find((e) => e.id === renameTargetId)
    : null;

  // Name existence check for rename (exclude current entity)
  const renameNameExists = useCallback(
    (name: string) =>
      entities.some(
        (e) =>
          e.name.toLowerCase() === name.toLowerCase() && e.id !== renameTargetId
      ),
    [entities, renameTargetId]
  );

  // Delete
  const handleDeleteClick = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
  }, [getSelectedIds]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTargetIds) {
      deleteTargetIds.forEach((id) => onDelete?.(id));
    }
    setDeleteTargetIds(null);
    setSelectedMap({});
  }, [deleteTargetIds, onDelete]);

  // Open
  const handleOpen = useCallback(() => {
    const entity = getSelectedEntity();
    if (!entity) return;

    if (entity.type === 'folder') {
      navigate(buildNavPath(entity.name));
    } else {
      setPreviewFile(entity as FileMetadata);
    }
  }, [getSelectedEntity, navigate, buildNavPath]);

  const handleDoubleClick = useCallback(
    (entity: EntityMetadata) => {
      if (entity.type === 'folder') {
        navigate(buildNavPath(entity.name));
      } else {
        setPreviewFile(entity as FileMetadata);
      }
    },
    [navigate, buildNavPath]
  );

  const isFolderLayout = entityType === 'folder';

  return (
    <div>
      <EntityControls
        onCreate={handleCreateClick}
        onRename={selectedCount === 1 ? handleRenameClick : undefined}
        onDelete={selectedCount > 0 ? handleDeleteClick : undefined}
        onOpen={selectedCount === 1 ? handleOpen : undefined}
      />

      {entities.length === 0 ? (
        <div
          className={
            isFolderLayout
              ? 'mt-2 w-full h-[50px] border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center'
              : 'mt-2 w-full h-[300px] border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center'
          }
        >
          Your {isFolderLayout ? 'folders' : 'files'} will be displayed here
        </div>
      ) : (
        <div
          className={
            isFolderLayout
              ? 'mt-2 flex grow-0 w-full gap-1 overflow-x-auto'
              : 'mt-2 flex flex-wrap gap-1'
          }
        >
          {entities.map((entity) => (
            <Entity
              key={entity.id}
              entity={entity}
              isSelected={!!selectedMap[entity.id]}
              onClick={() => toggleSelect(entity.id)}
              onDoubleClick={() => handleDoubleClick(entity)}
            />
          ))}
        </div>
      )}

      {/* Create folder dialog */}
      <NameDialog
        open={createOpen}
        title={`Create ${entityType === 'folder' ? 'Folder' : 'File'}`}
        placeholder={`Enter ${entityType === 'folder' ? 'folder' : 'file'} name...`}
        existsCheck={nameExists}
        existsMessage="An entity with this name already exists."
        onConfirm={handleCreateConfirm}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Upload file dialog */}
      {entityType === 'file' && (
        <FileUploadDialog
          open={uploadOpen}
          onConfirm={handleUploadConfirm}
          onCancel={() => setUploadOpen(false)}
        />
      )}

      {/* Rename dialog */}
      <NameDialog
        open={renameTargetId !== null}
        title={`Rename ${entityType === 'folder' ? 'Folder' : 'File'}`}
        initialValue={selectedEntity?.name ?? ''}
        placeholder="Enter new name..."
        existsCheck={renameNameExists}
        existsMessage="An entity with this name already exists."
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameTargetId(null)}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={deleteTargetIds !== null}
        title={`Delete ${entityType === 'folder' ? 'Folder(s)' : 'File(s)'}`}
        message={`Are you sure you want to delete ${deleteTargetIds?.length ?? 0} item(s)? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetIds(null)}
      />

      {/* File preview dialog */}
      <FilePreviewDialog
        open={previewFile !== null}
        file={previewFile}
        userId={userId}
        dataroomId={dataroomId}
        parentPath={parentPath}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
