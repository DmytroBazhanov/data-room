import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { EntityControls } from '@/components/custom/EntityControls.tsx';
import { NameDialog } from '@/components/custom/dialogs/NameDialog.tsx';
import { ConfirmDialog } from '@/components/custom/dialogs/ConfirmDialog.tsx';
import { cn } from '@/utils/tailwind.ts';
import type { FolderMetadata } from '@/types/dataroom.ts';

interface ApplicationSidebarProps {
  datarooms: FolderMetadata[];
  selectedDataroomId: string | null;
  onSelectDataroom: (id: string) => void;
  onCreateDataroom: (name: string) => void;
  onRenameDataroom: (id: string, newName: string) => void;
  onDeleteDataroom: (id: string) => void;
}

export function ApplicationSidebar({
  datarooms,
  selectedDataroomId,
  onSelectDataroom,
  onCreateDataroom,
  onRenameDataroom,
  onDeleteDataroom,
}: ApplicationSidebarProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[] | null>(null);

  const selectedCount = Object.keys(selectedMap).length;

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

  // Create
  const handleCreateClick = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCreateConfirm = useCallback(
    (name: string) => {
      onCreateDataroom(name);
      setCreateOpen(false);
    },
    [onCreateDataroom]
  );

  // Name existence check for create dialog
  const nameExists = useCallback(
    (name: string) =>
      datarooms.some((d) => d.name.toLowerCase() === name.toLowerCase()),
    [datarooms]
  );

  // Rename
  const handleRenameClick = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;
    setRenameTargetId(selectedIds[0]);
    setSelectedMap({});
  }, [getSelectedIds]);

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (renameTargetId) {
        onRenameDataroom(renameTargetId, newName);
      }
      setRenameTargetId(null);
    },
    [renameTargetId, onRenameDataroom]
  );

  const selectedDataroom = renameTargetId
    ? datarooms.find((d) => d.id === renameTargetId)
    : null;

  // Name existence check for rename (exclude current dataroom)
  const renameNameExists = useCallback(
    (name: string) =>
      datarooms.some(
        (d) =>
          d.name.toLowerCase() === name.toLowerCase() && d.id !== renameTargetId
      ),
    [datarooms, renameTargetId]
  );

  // Delete
  const handleDeleteClick = useCallback(() => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
  }, [getSelectedIds]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTargetIds) {
      deleteTargetIds.forEach((id) => onDeleteDataroom(id));
    }
    setDeleteTargetIds(null);
    setSelectedMap({});
  }, [deleteTargetIds, onDeleteDataroom]);

  return (
    <aside className="h-full w-full min-w-40 max-w-60 grow-2 overflow-y-auto p-4 bg-green-50 flex flex-col gap-2">
      <EntityControls
        onCreate={handleCreateClick}
        onRename={selectedCount === 1 ? handleRenameClick : undefined}
        onDelete={selectedCount > 0 ? handleDeleteClick : undefined}
      />

      {datarooms.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            No datarooms yet.
            <br />
            Create one to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {datarooms.map((dataroom) => (
            <div key={dataroom.id} className="flex items-center gap-1">
              <Button
                variant={
                  selectedDataroomId === dataroom.id ? 'default' : 'ghost'
                }
                size="sm"
                className={cn(
                  'flex-1 justify-start truncate',
                  selectedDataroomId === dataroom.id && 'bg-blue-100'
                )}
                onClick={() => {
                  onSelectDataroom(dataroom.id);
                  setSelectedMap({});
                }}
              >
                {dataroom.name}
              </Button>
              <input
                type="checkbox"
                className="size-4 shrink-0 cursor-pointer"
                checked={!!selectedMap[dataroom.id]}
                onChange={() => toggleSelect(dataroom.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <NameDialog
        open={createOpen}
        title="Create Dataroom"
        placeholder="Enter dataroom name..."
        existsCheck={nameExists}
        existsMessage="A dataroom with this name already exists."
        onConfirm={handleCreateConfirm}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Rename dialog */}
      <NameDialog
        open={renameTargetId !== null}
        title="Rename Dataroom"
        initialValue={selectedDataroom?.name ?? ''}
        placeholder="Enter new name..."
        existsCheck={renameNameExists}
        existsMessage="A dataroom with this name already exists."
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameTargetId(null)}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={deleteTargetIds !== null}
        title="Delete Dataroom(s)"
        message={`Are you sure you want to delete ${deleteTargetIds?.length ?? 0} dataroom(s)? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetIds(null)}
      />
    </aside>
  );
}
