import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Card({ children, className, hover = false, id, ...props }) {
  if (hover) {
    return (
      <motion.div
        id={id}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={cn('bg-surface rounded-xl border border-border p-6', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div id={id} className={cn('bg-surface rounded-xl border border-border p-6', className)} {...props}>
      {children}
    </div>
  );
}
