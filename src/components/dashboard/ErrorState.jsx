import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function ErrorState({ onRetry, message, compact = false }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-danger/20 flex flex-col items-center justify-center text-center',
        compact ? 'p-6 h-full' : 'p-12'
      )}
    >
      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center mb-3">
        <AlertTriangle size={18} className="text-danger" />
      </div>
      <p className="font-semibold text-text-primary text-sm mb-1">Gagal Memuat Data</p>
      <p className="text-xs text-text-secondary mb-4 max-w-xs">
        {message || 'Terjadi kesalahan saat mengambil data dari API. Periksa koneksi internet Anda.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw size={12} />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
