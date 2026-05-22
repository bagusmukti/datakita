import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getIndonesiaCurrent, getIndonesiaHistorical, getASEANComparison } from '../services/diseaseService';
import { formatNumber, formatDateShort } from '../lib/utils';

const STALE = 6 * 60 * 60 * 1000;

export function useDiseaseData() {
  const currentQ = useQuery({
    queryKey: ['disease', 'current'],
    queryFn: getIndonesiaCurrent,
    staleTime: STALE,
  });

  const historicalQ = useQuery({
    queryKey: ['disease', 'historical'],
    queryFn: () => getIndonesiaHistorical('all'),
    staleTime: STALE,
  });

  const aseanQ = useQuery({
    queryKey: ['disease', 'asean'],
    queryFn: getASEANComparison,
    staleTime: STALE,
  });

  const current = currentQ.data || {};
  const historical = historicalQ.data || [];

  const chartData = useMemo(() => {
    if (!historical.length) return [];
    const step = historical.length > 365 ? Math.ceil(historical.length / 365) : 1;
    return historical.filter((_, i) => i % step === 0).map((d) => ({
      date: d.date,
      'Kasus Baru': d.newCases,
      'Sembuh Baru': d.newRecovered,
      'Meninggal Baru': d.newDeaths,
      kasusAkumulasi: d.cases,
    }));
  }, [historical]);

  const distributionData = useMemo(() => {
    if (!current.cases) return [];
    const aktif = current.active || 0;
    const sembuh = current.recovered || 0;
    const meninggal = current.deaths || 0;
    return [
      { name: 'Aktif', value: aktif },
      { name: 'Sembuh', value: sembuh },
      { name: 'Meninggal', value: meninggal },
    ].filter((d) => d.value > 0);
  }, [current]);

  const rankingData = useMemo(() => {
    const asean = aseanQ.data || [];
    return asean
      .map((c) => ({ name: c.country, value: c.casesPerOneMillion || 0 }))
      .sort((a, b) => b.value - a.value);
  }, [aseanQ.data]);

  const peak = useMemo(() => {
    if (!historical.length) return null;
    return historical.reduce((max, d) => (d.newCases > (max?.newCases || 0) ? d : max), null);
  }, [historical]);

  const idxInAsean = rankingData.findIndex((c) => c.name === 'Indonesia');

  const insights = [
    {
      label: 'Total Kasus',
      value: current.cases ? `${formatNumber(current.cases)} kasus (per juta: ${formatNumber(current.casesPerOneMillion)})` : '—',
    },
    {
      label: 'Puncak Kasus Harian',
      value: peak ? `${formatNumber(peak.newCases)} kasus pada ${peak.date}` : '—',
    },
    {
      label: 'Peringkat di ASEAN',
      value: idxInAsean >= 0 ? `#${idxInAsean + 1} di Asia Tenggara (kasus per juta)` : '—',
    },
  ];

  const tableData = useMemo(() => {
    const step = historical.length > 500 ? Math.ceil(historical.length / 500) : 1;
    return historical
      .filter((_, i) => i % step === 0)
      .slice()
      .reverse()
      .map((d) => ({
        Tanggal: d.date,
        'Kasus Baru': formatNumber(d.newCases),
        'Sembuh Baru': formatNumber(d.newRecovered),
        'Meninggal Baru': formatNumber(d.newDeaths),
        'Akumulasi Kasus': formatNumber(d.cases),
        'Akumulasi Sembuh': formatNumber(d.recovered),
        'Akumulasi Meninggal': formatNumber(d.deaths),
        _raw: d,
      }));
  }, [historical]);

  return {
    current,
    historical,
    asean: aseanQ.data || [],
    chartData,
    distributionData,
    rankingData,
    insights,
    tableData,
    isLoading: currentQ.isLoading || historicalQ.isLoading,
    isError: currentQ.isError || historicalQ.isError,
    error: currentQ.error || historicalQ.error,
    refetch: () => {
      currentQ.refetch();
      historicalQ.refetch();
      aseanQ.refetch();
    },
  };
}
