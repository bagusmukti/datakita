import { useState } from 'react';
import { cn } from '../../lib/utils';

export function Tooltip({ content, children, className, side = 'top' }) {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={cn(
            'absolute z-[100] pointer-events-none',
            positions[side]
          )}
        >
          <div className="relative px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap max-w-xs leading-snug">
            {content}
            <div className={cn('absolute border-4 border-transparent', arrows[side])} />
          </div>
        </div>
      )}
    </div>
  );
}
