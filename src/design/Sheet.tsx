import { useEffect, useRef, type ReactNode } from 'react';

/** Bottom sheet. Stays mounted so open/close can animate with transform. */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('button, a, input')?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={`sheet ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="sheet__scrim" onClick={onClose} />
      <div ref={panel} className="sheet__panel" role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
