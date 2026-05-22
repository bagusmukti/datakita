import { Database } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmptyState({ message, compact = false }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border flex flex-col items-center justify-center text-center',
        compact ? 'p-6 h-full' : 'p-12'
      )}
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Database size={18} className="text-text-secondary" />
      </div>
      <p className="font-semibold text-text-primary text-sm mb-1">Tidak Ada Data</p>
      <p className="text-xs text-text-secondary max-w-xs">
        {message || 'Belum ada data yang sesuai dengan filter yang diterapkan.'}
      </p>
    </div>
  );
}
