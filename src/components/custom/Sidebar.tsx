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
  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  // Rename — operates on currently selected dataroom
  const handleRenameClick = useCallback(() => {
    if (!selectedDataroomId) return;
    setRenameOpen(true);
  }, [selectedDataroomId]);

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (selectedDataroomId) {
        onRenameDataroom(selectedDataroomId, newName);
      }
      setRenameOpen(false);
    },
    [selectedDataroomId, onRenameDataroom]
  );

  const selectedDataroom = selectedDataroomId
    ? datarooms.find((d) => d.id === selectedDataroomId)
    : null;

  // Name existence check for rename (exclude current dataroom)
  const renameNameExists = useCallback(
    (name: string) =>
      datarooms.some(
        (d) =>
          d.name.toLowerCase() === name.toLowerCase() &&
          d.id !== selectedDataroomId
      ),
    [datarooms, selectedDataroomId]
  );

  // Delete — operates on currently selected dataroom
  const handleDeleteClick = useCallback(() => {
    if (!selectedDataroomId) return;
    setDeleteOpen(true);
  }, [selectedDataroomId]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedDataroomId) {
      onDeleteDataroom(selectedDataroomId);
    }
    setDeleteOpen(false);
  }, [selectedDataroomId, onDeleteDataroom]);

  const hasSelection = selectedDataroomId !== null;

  return (
    <aside className="h-full w-full min-w-40 max-w-60 grow-2 overflow-y-auto p-4 bg-green-50 flex flex-col gap-2">
      <EntityControls
        onCreate={handleCreateClick}
        onRename={hasSelection ? handleRenameClick : undefined}
        onDelete={hasSelection ? handleDeleteClick : undefined}
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
            <Button
              key={dataroom.id}
              variant={selectedDataroomId === dataroom.id ? 'default' : 'ghost'}
              size="lg"
              className={cn(
                'flex-1 justify-start truncate text-lg cursor-pointer',
                selectedDataroomId === dataroom.id && 'bg-blue-500'
              )}
              onClick={() => onSelectDataroom(dataroom.id)}
            >
              {dataroom.name}
            </Button>
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
        open={renameOpen}
        title="Rename Dataroom"
        initialValue={selectedDataroom?.name ?? ''}
        placeholder="Enter new name..."
        existsCheck={renameNameExists}
        existsMessage="A dataroom with this name already exists."
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameOpen(false)}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Dataroom"
        message={`Are you sure you want to delete "${selectedDataroom?.name ?? ''}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </aside>
  );
}
