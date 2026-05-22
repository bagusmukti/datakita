import { useRef, useEffect } from 'react';
import { Search, Calendar, RotateCcw, Download, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useDataset } from '../../hooks/useDataset';
import { useFilters } from '../../hooks/useFilters';
import { Button } from '../ui/Button';
import { FilterChip } from '../ui/FilterChip';
import { Dropdown } from '../ui/Dropdown';
import { cn } from '../../lib/utils';

const DEPTH_CATEGORIES = [
  { value: 'all', label: 'Semua Kedalaman' },
  { value: 'Dangkal', label: 'Dangkal (<60km)' },
  { value: 'Menengah', label: 'Menengah (60–300km)' },
  { value: 'Dalam', label: 'Dalam (>300km)' },
];

const WB_INDICATORS = [
  { value: 'gdp', label: 'GDP (USD)' },
  { value: 'gdpPerCapita', label: 'GDP per Kapita' },
  { value: 'inflation', label: 'Inflasi (%)' },
  { value: 'population', label: 'Populasi' },
  { value: 'unemployment', label: 'Pengangguran (%)' },
];

export function FilterBar({ onExport, searchRef: externalSearchRef }) {
  const { activeDataset } = useDataset();
  const { filters, activeChips, setSearch, setCategory, setIndicator, resetFilters, removeFilter } = useFilters();
  const internalRef = useRef(null);
  const searchRef = externalSearchRef || internalRef;

  useEffect(() => {
    function handler(e) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchRef]);

  const placeholder =
    activeDataset === 'bmkg'
      ? 'Cari lokasi atau wilayah gempa…'
      : activeDataset === 'worldbank'
      ? 'Cari berdasarkan tahun…'
      : 'Cari berdasarkan tanggal…';

  return (
    <div className="sticky top-16 z-30 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              ref={searchRef}
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm',
                'placeholder:text-text-secondary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20',
                'transition-colors'
              )}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-text-secondary bg-gray-100 border border-border">
              /
            </kbd>
          </div>

          {activeDataset === 'bmkg' && (
            <Dropdown
              options={DEPTH_CATEGORIES}
              value={filters.category}
              onChange={setCategory}
            />
          )}

          {activeDataset === 'worldbank' && (
            <Dropdown
              options={WB_INDICATORS}
              value={filters.indicator}
              onChange={setIndicator}
            />
          )}

          {activeChips.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5">
              <RotateCcw size={12} />
              Reset
            </Button>
          )}

          <div className="ml-auto">
            <Button variant="primary" size="sm" onClick={onExport} className="gap-1.5">
              <Download size={13} />
              Export
              <ChevronDown size={12} />
            </Button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pb-1">
            <AnimatePresence>
              {activeChips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={() => removeFilter(chip.key)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
