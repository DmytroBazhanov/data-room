import { Button } from '@/components/ui/button.tsx';
import PlusIcon from '@/assets/svg/plus.svg';
import PencilIcon from '@/assets/svg/pencil.svg';
import TrashIcon from '@/assets/svg/trash.svg';
import FolderIcon from '@/assets/svg/folder.svg';

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
        disabled={!onCreate}
        onClick={onCreate}
      >
        <img alt="Create" src={PlusIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!onRename}
        onClick={onRename}
      >
        <img alt="Rename" src={PencilIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!onDelete}
        onClick={onDelete}
      >
        <img alt="Delete" src={TrashIcon} className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!onOpen}
        onClick={onOpen}
      >
        <img alt="Open" src={FolderIcon} className="size-4" />
      </Button>
    </div>
  );
}
