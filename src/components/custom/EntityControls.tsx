import { Button } from '@/components/ui/button.tsx';
import PlusIcon from '@/assets/svg/plus.svg';
import PencilIcon from '@/assets/svg/pencil.svg';
import TrashIcon from '@/assets/svg/trash.svg';
import FolderOpenIcon from '@/assets/svg/open-folder.svg';

interface EntityControlsProps {
  onCreate?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onOpen?: () => void;
}

export function EntityControls({
  onCreate,
  onRename,
  onDelete,
  onOpen,
}: EntityControlsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        title={onCreate ? 'Create' : undefined}
        disabled={!onCreate}
        onClick={onCreate}
      >
        <img alt="Create" src={PlusIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        title={onRename ? 'Rename' : undefined}
        disabled={!onRename}
        onClick={onRename}
      >
        <img alt="Rename" src={PencilIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        title={onDelete ? 'Delete' : undefined}
        disabled={!onDelete}
        onClick={onDelete}
      >
        <img alt="Delete" src={TrashIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        title={onOpen ? 'Open' : undefined}
        disabled={!onOpen}
        onClick={onOpen}
      >
        <img alt="Open" src={FolderOpenIcon} className="size-4" />
      </Button>
    </div>
  );
}
