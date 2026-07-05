import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { twMerge } from 'tailwind-merge';

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
}

export function Dialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  confirmDisabled = false,
  className = '',
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={twMerge(
          'relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl',
          className
        )}
      >
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-2">
          {cancelLabel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
