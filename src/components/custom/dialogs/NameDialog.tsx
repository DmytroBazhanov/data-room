import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/components/custom/dialogs/Dialog.tsx';

interface NameDialogProps {
  open: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  existsCheck?: (name: string) => boolean;
  existsMessage?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function NameDialog({
  open,
  title,
  initialValue = '',
  placeholder = 'Enter name...',
  existsCheck,
  existsMessage = 'An item with this name already exists.',
  onConfirm,
  onCancel,
}: NameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialValue]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }

    if (existsCheck && existsCheck(trimmed)) {
      setError(existsMessage);
      return;
    }

    onConfirm(trimmed);
  };

  return (
    <Dialog
      open={open}
      title={title}
      confirmLabel="Confirm"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      confirmDisabled={!value.trim()}
    >
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Dialog>
  );
}
