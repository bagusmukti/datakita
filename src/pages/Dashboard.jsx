import { useState, useRef, useEffect, useCallback } from 'react';
import { useDataset } from '../hooks/useDataset';
import { useFilters } from '../hooks/useFilters';
import { useBmkgData } from '../hooks/useBmkgData';
import { useWorldBankData } from '../hooks/useWorldBankData';
import { useDiseaseData } from '../hooks/useDiseaseData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import { FilterBar } from '../components/dashboard/FilterBar';
import { FeaturedChart } from '../components/dashboard/FeaturedChart';
import { DistributionChart } from '../components/dashboard/DistributionChart';
import { RankingChart } from '../components/dashboard/RankingChart';
import { InsightsCard } from '../components/dashboard/InsightsCard';
import { DataTable } from '../components/dashboard/DataTable';
import { ExportModal } from '../components/dashboard/ExportModal';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { parseDepth, getDepthCategory } from '../lib/utils';

export function Dashboard() {
  const { activeDataset } = useDataset();
  const { filters } = useFilters();
  const [exportOpen, setExportOpen] = useState(false);
  const searchRef = useRef(null);

  const bmkgData = useBmkgData();
  const worldBankData = useWorldBankData();
  const diseaseData = useDiseaseData();

  useEffect(() => {
    function handler(e) {
      if (e.key === 'e' || e.key === 'E') {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          setExportOpen(true);
        }
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const activeData = activeDataset === 'bmkg' ? bmkgData : activeDataset === 'worldbank' ? worldBankData : diseaseData;
  const isLoading = activeData.isLoading;
  const isError = activeData.isError;

  const tableData = applyFilters(activeDataset, activeData.tableData, filters);
  const distributionData = activeData.distributionData;
  const rankingData = activeData.rankingData;
  const insights = activeData.insights;

  return (
    <div className="min-h-screen">
      <HeroHeader bmkgData={bmkgData} worldBankData={worldBankData} diseaseData={diseaseData} />
      <FilterBar onExport={() => setExportOpen(true)} searchRef={searchRef} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <FeaturedChart
          bmkgData={bmkgData}
          worldBankData={worldBankData}
          diseaseData={diseaseData}
          isLoading={isLoading}
          isError={isError}
          onRetry={activeData.refetch}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DistributionChart
            data={distributionData}
            isLoading={isLoading}
            isError={isError}
            onRetry={activeData.refetch}
          />
          <RankingChart
            data={rankingData}
            isLoading={isLoading}
            isError={isError}
            onRetry={activeData.refetch}
          />
          <InsightsCard insights={insights} isLoading={isLoading} />
        </div>

        {activeDataset === 'bmkg' && <WeatherWidget />}

        <DataTable data={tableData} isLoading={isLoading} />

        <DatasetDisclosure />
      </div>

      <div className="fixed bottom-4 right-4 hidden sm:flex items-center gap-2 text-xs text-text-secondary bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-sm pointer-events-none">
        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 border border-border">/</kbd>
        <span>Cari</span>
        <span className="text-border">·</span>
        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 border border-border">E</kbd>
        <span>Export</span>
        <span className="text-border">·</span>
        <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 border border-border">Esc</kbd>
        <span>Tutup</span>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} tableData={tableData} />
    </div>
  );
}

function applyFilters(dataset, data, filters) {
  if (!data) return [];
  let result = [...data];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((row) =>
      Object.entries(row)
        .filter(([k]) => k !== '_raw')
        .some(([, v]) => String(v ?? '').toLowerCase().includes(q))
    );
  }

  if (dataset === 'bmkg' && filters.category !== 'all') {
    result = result.filter((row) => {
      const depth = parseDepth(row.Kedalaman);
      return getDepthCategory(depth) === filters.category;
    });
  }

  return result;
}

function DatasetDisclosure() {
  const [open, setOpen] = useState(false);
  const { activeDataset, currentDataset } = useDataset();

  const descriptions = {
    bmkg: {
      title: 'Tentang Data Gempa & Cuaca BMKG',
      body: `BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) menyediakan data seismik dan cuaca secara realtime melalui API publik. Data gempa mencakup lokasi episenter, kedalaman, magnitudo, dan potensi tsunami. Data diperbarui otomatis setiap kali terjadi gempa baru. Magnitudo ≥5.0 dikategorikan sebagai gempa signifikan. Kedalaman dibagi menjadi tiga kategori: dangkal (<60 km), menengah (60–300 km), dan dalam (>300 km).`,
    },
    worldbank: {
      title: 'Tentang Data Ekonomi World Bank',
      body: `World Bank menyediakan data ekonomi makro Indonesia dari tahun 1960 hingga terkini melalui API terbuka. Indikator mencakup GDP (Produk Domestik Bruto), GDP per kapita, tingkat inflasi, populasi total, dan tingkat pengangguran. Data diperbarui tahunan berdasarkan laporan resmi pemerintah Indonesia. Semua nilai GDP dalam dolar AS saat ini (current USD).`,
    },
    disease: {
      title: 'Tentang Data COVID-19 Indonesia (disease.sh)',
      body: `disease.sh adalah API COVID-19 gratis dan terbuka yang mengagregasi data dari sumber resmi termasuk WHO, Johns Hopkins University, dan badan kesehatan nasional. Data Indonesia mencakup total kasus, kematian, pemulihan, serta riwayat harian sejak Januari 2020. Data historis digunakan untuk menghitung kasus harian baru dengan cara mengurangi nilai kumulatif berturut-turut.`,
    },
  };

  const desc = descriptions[activeDataset];

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/60 transition-colors"
      >
        <span className="font-semibold text-text-primary text-sm">{desc.title}</span>
        <span className={`text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-sm text-text-secondary leading-relaxed pt-4">{desc.body}</p>
          <a
            href={currentDataset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline font-medium"
          >
            Kunjungi sumber data → {currentDataset.source}
          </a>
        </div>
      )}
    </div>
  );
}
