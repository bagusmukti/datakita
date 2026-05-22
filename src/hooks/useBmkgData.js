import { useQuery } from '@tanstack/react-query';
import { getLatestEarthquake, getRecentEarthquakes, getFeltEarthquakes } from '../services/bmkgService';
import { parseDepth, getDepthCategory } from '../lib/utils';

const STALE = 5 * 60 * 1000;

export function useBmkgData() {
  const latestQuery = useQuery({
    queryKey: ['bmkg', 'latest'],
    queryFn: getLatestEarthquake,
    staleTime: STALE,
    retry: 2,
  });

  const recentQuery = useQuery({
    queryKey: ['bmkg', 'recent'],
    queryFn: getRecentEarthquakes,
    staleTime: STALE,
    retry: 2,
  });

  const feltQuery = useQuery({
    queryKey: ['bmkg', 'felt'],
    queryFn: getFeltEarthquakes,
    staleTime: STALE,
    retry: 2,
  });

  const recent = recentQuery.data || [];
  const felt = feltQuery.data || [];
  const combined = [...recent, ...felt].reduce((acc, e) => {
    if (!acc.find((x) => x.dateTime === e.dateTime && x.magnitude === e.magnitude)) acc.push(e);
    return acc;
  }, []);

  // Pastikan gempa terbaru (autogempa) selalu ada di tabel, meski magnitudonya < 5.0
  const latest = latestQuery.data;
  if (latest && !combined.find((e) => e.dateTime === latest.dateTime && e.magnitude === latest.magnitude)) {
    combined.unshift(latest);
  }

  // Urutkan terbaru dulu
  combined.sort((a, b) => {
    if (!a.dateTime && !b.dateTime) return 0;
    if (!a.dateTime) return 1;
    if (!b.dateTime) return -1;
    return new Date(b.dateTime) - new Date(a.dateTime);
  });

  const chartData = recent.slice(0, 15).map((e, i) => ({
    index: i + 1,
    label: `#${i + 1}`,
    magnitude: e.magnitude,
    kedalaman: parseDepth(e.kedalaman),
    wilayah: e.wilayah,
    tanggal: e.tanggal,
  }));

  const depthCounts = { Dangkal: 0, Menengah: 0, Dalam: 0 };
  combined.forEach((e) => {
    const cat = getDepthCategory(parseDepth(e.kedalaman));
    depthCounts[cat] = (depthCounts[cat] || 0) + 1;
  });
  const distributionData = Object.entries(depthCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const regionCounts = {};
  combined.forEach((e) => {
    const region = extractRegion(e.wilayah);
    if (region) regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  const rankingData = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, value: count }));

  const significant = combined.filter((e) => e.magnitude >= 5.0);
  const largest = [...combined].sort((a, b) => b.magnitude - a.magnitude)[0];

  const insights = [
    {
      label: 'Gempa Terkini',
      value: latestQuery.data ? `M${latestQuery.data.magnitude} — ${latestQuery.data.wilayah?.split(' ').slice(-3).join(' ')}` : '—',
    },
    {
      label: 'Gempa M5.0+',
      value: `${significant.length} kejadian dari ${combined.length} data terakhir`,
    },
    {
      label: 'Magnitudo Terbesar',
      value: largest ? `M${largest.magnitude} di ${extractRegion(largest.wilayah) || 'tidak diketahui'}` : '—',
    },
  ];

  const tableData = combined.map((e) => ({
    Tanggal: e.tanggal,
    Waktu: e.jam,
    Magnitude: e.magnitude,
    Kedalaman: e.kedalaman,
    Lokasi: e.wilayah,
    Koordinat: e.coordinates,
    'Potensi Tsunami': e.potensi,
    _raw: e,
  }));

  return {
    latest: latestQuery.data,
    recent,
    felt,
    combined,
    chartData,
    distributionData,
    rankingData,
    insights,
    tableData,
    isLoading: latestQuery.isLoading || recentQuery.isLoading,
    isError: latestQuery.isError || recentQuery.isError,
    error: latestQuery.error || recentQuery.error,
    refetch: () => {
      latestQuery.refetch();
      recentQuery.refetch();
      feltQuery.refetch();
    },
  };
}

function extractRegion(wilayah) {
  if (!wilayah) return '';
  const parts = wilayah.split(' ');
  const idx = parts.findIndex((p) =>
    ['BaratLaut', 'TimurLaut', 'Barat', 'Timur', 'Utara', 'Selatan', 'Tenggara', 'Barat', 'Laut'].includes(p)
  );
  if (idx > 0 && idx < parts.length - 1) return parts.slice(idx + 1).join(' ');
  return parts.slice(-2).join(' ');
}
