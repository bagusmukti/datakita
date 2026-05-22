import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-gray-100 text-text-secondary',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-amber-700',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-yellow-700',
  danger: 'bg-danger/10 text-danger',
  supporting: 'bg-supporting/30 text-primary',
};

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono tracking-tight',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
