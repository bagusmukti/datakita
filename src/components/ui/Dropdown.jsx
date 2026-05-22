import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Dropdown({ trigger, options, value, onChange, align = 'left', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  const selected = options?.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger ? (
        <div onClick={() => setOpen((p) => !p)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen((p) => !p)}
          className={cn(
            'inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface',
            'text-sm text-text-primary hover:border-primary/40 transition-colors'
          )}
        >
          {selected?.icon && <selected.icon size={14} />}
          <span>{selected?.label || 'Pilih...'}</span>
          <ChevronDown size={14} className={cn('text-text-secondary transition-transform', open && 'rotate-180')} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-50 mt-1 min-w-[200px] bg-surface rounded-xl border border-border shadow-lg py-1',
              'max-h-64 overflow-y-auto scrollbar-thin',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            ref={listRef}
          >
            {options?.map((opt) => (
              <button
                key={opt.value}
                ref={value === opt.value ? selectedRef : null}
                onClick={() => { onChange?.(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                  'hover:bg-gray-50',
                  value === opt.value ? 'text-primary font-medium' : 'text-text-primary'
                )}
              >
                {opt.icon && <opt.icon size={14} className="shrink-0" />}
                <span className="flex-1">{opt.label}</span>
                {opt.description && <span className="text-xs text-text-secondary">{opt.description}</span>}
                {value === opt.value && <Check size={13} className="text-primary shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
