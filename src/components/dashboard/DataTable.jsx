import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Copy, Columns, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataset } from '../../hooks/useDataset';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { SkeletonCard } from '../ui/SkeletonLoader';
import { cn } from '../../lib/utils';

export function DataTable({ data, isLoading }) {
  const { activeDataset } = useDataset();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [copied, setCopied] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const columns = useMemo(() => getColumns(activeDataset), [activeDataset]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      if (!globalFilter) return true;
      return Object.values(row)
        .filter((v) => typeof v !== 'object')
        .some((v) => String(v).toLowerCase().includes(globalFilter.toLowerCase()));
    });
  }, [data, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true,
  });

  if (isLoading) return <SkeletonCard rows={8} />;

  const allColumns = table.getAllLeafColumns().filter((c) => c.id !== '_raw');
  const columnOptions = allColumns.map((col) => ({
    value: col.id,
    label: col.id,
    isVisible: col.getIsVisible(),
  }));

  function copyRow(row) {
    const json = JSON.stringify(row._raw || row, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(row);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const { pageIndex, pageSize } = pagination;
  const totalRows = filteredData.length;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Data Tabel</h3>
          <p className="text-xs text-text-secondary mt-0.5">{totalRows} baris ditemukan</p>
        </div>
        <Badge variant="default" className="ml-0">{totalRows}</Badge>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={globalFilter}
              onChange={(e) => { setGlobalFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
              placeholder="Filter tabel…"
              className="h-8 pl-8 pr-3 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary/50 w-36 sm:w-48"
            />
          </div>

          <ColumnToggle columns={allColumns} />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#F5F5F0] border-b border-border">
                {hg.headers.map((header) => {
                  if (header.column.id === '_raw') return null;
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-text-secondary whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className={cn('flex items-center gap-1 hover:text-text-primary transition-colors', header.column.getCanSort() && 'cursor-pointer')}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-text-secondary/50">
                              {header.column.getIsSorted() === 'asc' ? <ArrowUp size={11} /> : header.column.getIsSorted() === 'desc' ? <ArrowDown size={11} /> : <ArrowUpDown size={11} />}
                            </span>
                          )}
                        </button>
                      )}
                    </th>
                  );
                })}
                <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary w-20 text-right">Aksi</th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12 text-text-secondary text-sm">
                  Tidak ada data yang cocok
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-gray-50/60 transition-colors">
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === '_raw') return null;
                    return (
                      <td key={cell.id} className="px-4 py-3 text-sm text-text-primary font-mono whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedRow(selectedRow === row.original ? null : row.original)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          selectedRow === row.original
                            ? 'text-primary bg-primary/10'
                            : 'text-text-secondary hover:text-primary hover:bg-primary/10'
                        )}
                        title="Lihat detail"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => copyRow(row.original)}
                        className={cn('p-1.5 rounded-md transition-colors', copied === row.original ? 'text-success bg-success/10' : 'text-text-secondary hover:text-primary hover:bg-primary/10')}
                        title="Salin sebagai JSON"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-[#FAFAF7]">
        <p className="text-xs text-text-secondary font-mono">
          {totalRows > 0 ? `Menampilkan ${start}–${end} dari ${totalRows}` : 'Tidak ada data'}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 h-7 w-7">
            <ChevronLeft size={14} />
          </Button>
          {Array.from({ length: Math.min(table.getPageCount(), 7) }, (_, i) => {
            const page = i;
            return (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={cn('h-7 w-7 rounded-md text-xs font-mono transition-colors', pageIndex === page ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100')}
              >
                {page + 1}
              </button>
            );
          })}
          {table.getPageCount() > 7 && <span className="text-xs text-text-secondary px-1">…</span>}
          <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 h-7 w-7">
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {selectedRow && (
          <RowDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RowDetailModal({ row, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const entries = Object.entries(row).filter(([k]) => k !== '_raw');

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="font-semibold text-text-primary text-sm">Detail Baris</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin p-5 space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide w-36 shrink-0 pt-0.5">
                {key}
              </span>
              <span className="text-sm font-mono text-text-primary break-all">
                {value === null || value === undefined || value === '' ? (
                  <span className="text-text-secondary">—</span>
                ) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ColumnToggle({ columns }) {
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text-secondary hover:border-primary/40 transition-colors">
          <Columns size={13} />
          <span>Kolom</span>
        </button>
      }
      align="right"
      options={columns.map((col) => ({
        value: col.id,
        label: col.id,
        icon: col.getIsVisible() ? Eye : Eye,
      }))}
      value={null}
      onChange={(colId) => {
        const col = columns.find((c) => c.id === colId);
        if (col) col.toggleVisibility();
      }}
    />
  );
}

function getColumns(activeDataset) {
  const common = [
    {
      id: '_raw',
      accessorKey: '_raw',
      header: '',
      cell: () => null,
      enableHiding: false,
    },
  ];

  if (activeDataset === 'bmkg') {
    return [
      col('Tanggal'),
      col('Waktu'),
      numCol('Magnitude', 'Magnitude'),
      col('Kedalaman'),
      longCol('Lokasi'),
      col('Koordinat'),
      tsunamiCol(),
      ...common,
    ];
  }

  if (activeDataset === 'worldbank') {
    return [
      col('Tahun'),
      col('GDP (USD)'),
      col('GDP per Kapita'),
      col('Inflasi (%)'),
      col('Populasi'),
      col('Pengangguran (%)'),
      ...common,
    ];
  }

  if (activeDataset === 'disease') {
    return [
      col('Tanggal'),
      numCol('Kasus Baru', 'Kasus Baru'),
      numCol('Sembuh Baru', 'Sembuh Baru'),
      numCol('Meninggal Baru', 'Meninggal Baru'),
      col('Akumulasi Kasus'),
      col('Akumulasi Sembuh'),
      col('Akumulasi Meninggal'),
      ...common,
    ];
  }

  return common;
}

function col(id) {
  return { id, accessorKey: id, header: id, cell: (info) => info.getValue() || '—' };
}

function numCol(id, key) {
  return {
    id,
    accessorKey: key,
    header: id,
    cell: (info) => {
      const v = info.getValue();
      if (v === null || v === undefined || v === '—') return '—';
      return v;
    },
  };
}

function longCol(id) {
  return {
    id,
    accessorKey: id,
    header: id,
    cell: (info) => {
      const v = info.getValue();
      if (!v) return '—';
      return (
        <span className="block max-w-[200px] truncate" title={String(v)}>
          {v}
        </span>
      );
    },
  };
}

function tsunamiCol() {
  return {
    id: 'Potensi Tsunami',
    accessorKey: 'Potensi Tsunami',
    header: 'Potensi Tsunami',
    cell: (info) => {
      const v = String(info.getValue() || '').toLowerCase().trim();
      if (!v || v === '—' || v === '-') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
            Tidak Dinilai
          </span>
        );
      }
      if (v.includes('tidak berpotensi') || v.includes('tidak ada potensi')) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
            Tidak Berpotensi
          </span>
        );
      }
      // berpotensi tsunami
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
          ⚠ Berpotensi
        </span>
      );
    },
  };
}
