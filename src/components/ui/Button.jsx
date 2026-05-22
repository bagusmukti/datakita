import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-accent text-white hover:bg-amber-500 focus:ring-accent/40',
  secondary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/40',
  ghost: 'bg-transparent text-text-secondary hover:bg-gray-100 focus:ring-gray-300',
  outline: 'bg-transparent border border-border text-text-primary hover:bg-gray-50 focus:ring-gray-300',
  danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger/40',
};

const sizes = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
};

export function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
