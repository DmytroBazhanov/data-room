import { useMemo, useEffect } from 'react';
import type { FileMetadata } from '@/types/dataroom.ts';

interface FilePreviewProps {
  file: FileMetadata;
  blob: Blob | null;
}

export function FilePreview({ file, blob }: FilePreviewProps) {
  const blobUrl = useMemo(() => {
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [blob]);

  // Revoke blob URL on unmount or blob change
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!blob || !blobUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-gray-300 p-8">
        <p className="text-sm text-muted-foreground">
          No preview available for this file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
        <span className="font-medium">{file.name}</span>
        <span className="text-muted-foreground">{file.mimeType}</span>
        <span className="text-muted-foreground">
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
      </div>
      <iframe
        src={blobUrl}
        title={file.name}
        className="w-full rounded-md border"
        style={{ height: '70vh', minHeight: '400px' }}
      />
    </div>
  );
}
