import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog } from '@/components/custom/dialogs/Dialog.tsx';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_NAME_LENGTH = 50;
const ALLOWED_TYPE = 'application/pdf';

interface FileValidationResult {
  valid: boolean;
  originalName: string;
  processedName: string;
  file: File;
  errors: string[];
}

interface FileUploadDialogProps {
  open: boolean;
  onConfirm: (files: File[]) => void;
  onCancel: () => void;
}

export function FileUploadDialog({
  open,
  onConfirm,
  onCancel,
}: FileUploadDialogProps) {
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRawFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setRawFiles(files);
  };

  // Process files with all validation rules
  const { validFiles, errors: globalErrors } = useMemo(() => {
    const results: FileValidationResult[] = [];
    const nameCountMap = new Map<string, number>();

    for (const file of rawFiles) {
      const errors: string[] = [];

      // Empty file check
      if (file.size === 0) {
        errors.push('File is empty');
      }

      // Size check
      if (file.size > MAX_FILE_SIZE) {
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(`File too large (${mb} MB). Maximum is 5 MB.`);
      }

      // Type check
      if (file.type !== ALLOWED_TYPE) {
        errors.push(
          `Only PDF files are allowed. Got: ${file.type || 'unknown'}`
        );
      }

      // Name processing
      let processedName = file.name;

      // Remove extension for truncation, then re-add
      const lastDot = processedName.lastIndexOf('.');
      const baseName =
        lastDot > 0 ? processedName.slice(0, lastDot) : processedName;
      const ext = lastDot > 0 ? processedName.slice(lastDot) : '';

      // Truncate long names (> 50 including extension)
      const maxBaseLen = MAX_NAME_LENGTH - ext.length;
      if (baseName.length > maxBaseLen) {
        processedName = baseName.slice(0, maxBaseLen) + ext;
      }

      // Deduplicate names by adding index numbers
      const count = nameCountMap.get(processedName) ?? 0;
      if (count > 0) {
        const insertIdx =
          lastDot > 0 ? processedName.lastIndexOf('.') : processedName.length;
        const dedupExt = insertIdx > 0 ? processedName.slice(insertIdx) : '';
        const dedupBase =
          insertIdx > 0 ? processedName.slice(0, insertIdx) : processedName;
        processedName = `${dedupBase} (${count})${dedupExt}`;
      }
      nameCountMap.set(processedName, count + 1);

      results.push({
        valid: errors.length === 0,
        originalName: file.name,
        processedName,
        file,
        errors,
      });
    }

    const valid = results.filter((r) => r.valid);
    const allErrors = results
      .filter((r) => !r.valid)
      .flatMap((r) => r.errors.map((e) => `${r.originalName}: ${e}`));

    return { validFiles: valid, errors: allErrors };
  }, [rawFiles]);

  const handleConfirm = () => {
    if (validFiles.length > 0) {
      // Create renamed File objects from processed names
      const renamed = validFiles.map((vf) => {
        if (vf.processedName !== vf.file.name) {
          return new File([vf.file], vf.processedName, {
            type: vf.file.type,
            lastModified: vf.file.lastModified,
          });
        }
        return vf.file;
      });
      onConfirm(renamed);
    }
  };

  return (
    <Dialog
      open={open}
      title="Upload Files"
      confirmLabel={`Upload ${validFiles.length > 0 ? `(${validFiles.length})` : ''}`}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      confirmDisabled={validFiles.length === 0}
    >
      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />

        {globalErrors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2">
            <p className="mb-1 text-sm font-medium text-red-600">
              Validation errors:
            </p>
            <ul className="list-inside list-disc text-xs text-red-500">
              {globalErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {validFiles.length > 0 && (
          <div className="rounded-md bg-gray-50 p-2">
            <p className="mb-1 text-sm font-medium">
              Ready to upload ({validFiles.length}):
            </p>
            <ul className="list-inside list-disc text-xs">
              {validFiles.map((vf, i) => (
                <li key={i}>
                  {vf.processedName}{' '}
                  <span className="text-muted-foreground">
                    ({(vf.file.size / 1024).toFixed(1)} KB)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {rawFiles.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Allowed: PDF files only, up to 5 MB each. Names longer than 50
            characters will be trimmed.
          </p>
        )}
      </div>
    </Dialog>
  );
}
