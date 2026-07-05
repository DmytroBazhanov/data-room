import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFileBlob } from '@/network/api/dataroom-api.ts';
import { FilePreview } from '@/components/custom/dialogs/FilePreview.tsx';
import { Dialog } from '@/components/custom/dialogs/Dialog.tsx';
import type { FileMetadata } from '@/types/dataroom.ts';

interface FilePreviewDialogProps {
  open: boolean;
  file: FileMetadata | null;
  userId: string | undefined;
  dataroomId: string | undefined;
  parentPath: string | null;
  onClose: () => void;
}

export function FilePreviewDialog({
  open,
  file,
  userId,
  dataroomId,
  parentPath,
  onClose,
}: FilePreviewDialogProps) {
  const [blob, setBlob] = useState<Blob | null>(null);

  const { data: fetchedBlob } = useQuery({
    queryKey: ['file-blob', dataroomId, parentPath, file?.id],
    queryFn: () => fetchFileBlob(userId!, dataroomId!, parentPath, file!.id),
    enabled: open && !!userId && !!dataroomId && !!file,
  });

  useEffect(() => {
    if (fetchedBlob !== undefined) {
      setBlob(fetchedBlob);
    }
  }, [fetchedBlob]);

  useEffect(() => {
    if (!open) {
      setBlob(null);
    }
  }, [open]);

  if (!file) return null;

  return (
    <Dialog
      open={open}
      className="max-w-[1400px]"
      title="File Preview"
      confirmLabel="Close"
      cancelLabel=""
      onConfirm={onClose}
      onCancel={onClose}
    >
      <FilePreview file={file} blob={blob} />
    </Dialog>
  );
}
