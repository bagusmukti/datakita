import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function FilterChip({ label, onRemove, className }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.12 }}
      className={cn(
        'inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1.5 rounded-full text-xs font-medium',
        'bg-primary/10 text-primary border border-primary/20',
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
          aria-label="Hapus filter"
        >
          <X size={10} />
        </button>
      )}
    </motion.span>
  );
}
