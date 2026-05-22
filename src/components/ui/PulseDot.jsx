import { cn } from '../../lib/utils';

const colors = {
  green: 'bg-success',
  amber: 'bg-accent',
  red: 'bg-danger',
  blue: 'bg-primary',
  gray: 'bg-gray-400',
};

export function PulseDot({ color = 'green', size = 'sm', pulse = true, className }) {
  const sz = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <span className={cn('relative inline-flex shrink-0', sz, className)}>
      {pulse && (
        <span
          className={cn('absolute inset-0 rounded-full opacity-75 animate-ping', colors[color])}
          style={{ animationDuration: '2s' }}
        />
      )}
      <span className={cn('relative inline-flex rounded-full', sz, colors[color])} />
    </span>
  );
}
