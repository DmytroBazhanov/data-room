import { cn } from '@/utils/tailwind.ts';
import FolderSvg from '@/assets/svg/folder.svg';
import FileSvg from '@/assets/svg/file.svg';
import type { EntityMetadata } from '@/types/dataroom.ts';

interface EntityProps {
  entity: EntityMetadata;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function Entity({
  entity,
  isSelected,
  onClick,
  onDoubleClick,
}: EntityProps) {
  const { type, name, dataroomId } = entity;

  if (type === 'folder') {
    return (
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 select-none h-[40px] shrink-0 max-w-[180px]',
          isSelected && 'bg-blue-100 ring-1 ring-blue-400',
          !isSelected && 'hover:bg-gray-100'
        )}
      >
        <img alt="Folder" src={FolderSvg} className="size-5 shrink-0" />
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-sm font-bold truncate">{name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {dataroomId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-between rounded-md px-2 py-2 select-none h-[100px] shrink-0 max-w-[180px]',
        isSelected && 'bg-blue-100 ring-1 ring-blue-400',
        !isSelected && 'hover:bg-gray-100'
      )}
    >
      <span className="w-full text-sm font-bold truncate min-w-0">{name}</span>
      <img alt="File" src={FileSvg} className="size-8 shrink-0" />
    </div>
  );
}
