import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, FileText, Download, Check } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { exportCSV, exportPDF } from '../../lib/exportHelpers';

export function ExportModal({ open, onClose, tableData }) {
  const { activeDataset, currentDataset } = useDataset();
  const [format, setFormat] = useState('csv');
  const [includeChart, setIncludeChart] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setDone(false); setExporting(false); }
    function handler(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  async function handleExport() {
    setExporting(true);
    try {
      const cleanData = (tableData || []).map(({ _raw, ...rest }) => rest);
      if (format === 'csv') {
        exportCSV(cleanData, activeDataset, includeMeta);
      } else {
        await exportPDF('featured-chart', cleanData, activeDataset, currentDataset.fullName, includeChart);
      }
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1200);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-[480px] bg-surface rounded-2xl border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
            <div>
              <h2 className="font-bold text-text-primary text-lg">Export Data</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Pilih format dan opsi data yang ingin diunduh
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors ml-4">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Format</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'csv', label: 'CSV', sub: 'Spreadsheet · Excel-compatible', icon: FileSpreadsheet },
                  { id: 'pdf', label: 'PDF', sub: 'Laporan · Siap cetak', icon: FileText },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all text-left',
                      format === opt.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-gray-300'
                    )}
                  >
                    <opt.icon size={20} className={format === opt.id ? 'text-accent' : 'text-text-secondary'} />
                    <div>
                      <p className={cn('font-semibold text-sm', format === opt.id ? 'text-accent' : 'text-text-primary')}>{opt.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Opsi</p>
              <div className="space-y-2.5">
                {[
                  { id: 'includeChart', label: 'Sertakan grafik', sub: 'Khusus PDF', value: includeChart, set: setIncludeChart, disabled: format !== 'pdf' },
                  { id: 'includeFilters', label: 'Sertakan filter aktif', sub: 'Terapkan filter saat ini', value: includeFilters, set: setIncludeFilters },
                  { id: 'includeMeta', label: 'Sertakan metadata sumber', sub: 'Nama API, tanggal ekspor', value: includeMeta, set: setIncludeMeta },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={cn('flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors', opt.disabled && 'opacity-40 cursor-not-allowed')}
                  >
                    <input
                      type="checkbox"
                      checked={opt.value}
                      onChange={(e) => opt.set(e.target.checked)}
                      disabled={opt.disabled}
                      className="w-4 h-4 rounded border-gray-300 text-primary accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{opt.label}</p>
                      <p className="text-xs text-text-secondary">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-bg rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">Dataset:</span> {currentDataset.fullName}
                <br />
                <span className="font-semibold text-text-primary">Baris:</span>{' '}
                {(tableData || []).length} baris
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 pb-6">
            <Button variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={exporting || done}
              className="flex-1 gap-2"
            >
              {done ? (
                <><Check size={14} /> Berhasil!</>
              ) : exporting ? (
                <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Mengekspor…</>
              ) : (
                <><Download size={14} /> Unduh Sekarang</>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
