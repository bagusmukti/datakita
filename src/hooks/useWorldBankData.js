import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGDP, getGDPPerCapita, getInflation, getPopulation, getUnemployment, joinByYear } from '../services/worldBankService';
import { formatCompact, formatPercent } from '../lib/utils';

const STALE = 24 * 60 * 60 * 1000;

export function useWorldBankData() {
  const gdpQ = useQuery({ queryKey: ['worldbank', 'gdp'], queryFn: getGDP, staleTime: STALE });
  const gdpPcQ = useQuery({ queryKey: ['worldbank', 'gdpPerCapita'], queryFn: getGDPPerCapita, staleTime: STALE });
  const inflQ = useQuery({ queryKey: ['worldbank', 'inflation'], queryFn: getInflation, staleTime: STALE });
  const popQ = useQuery({ queryKey: ['worldbank', 'population'], queryFn: getPopulation, staleTime: STALE });
  const unemQ = useQuery({ queryKey: ['worldbank', 'unemployment'], queryFn: getUnemployment, staleTime: STALE });

  const joined = useMemo(
    () => joinByYear(gdpQ.data, gdpPcQ.data, inflQ.data, popQ.data, unemQ.data),
    [gdpQ.data, gdpPcQ.data, inflQ.data, popQ.data, unemQ.data]
  );

  const latest = joined[joined.length - 1] || {};
  const nonNull = joined.filter((r) => r.gdp);

  const decades = {};
  nonNull.forEach((r) => {
    const decade = `${Math.floor(parseInt(r.year) / 10) * 10}-an`;
    decades[decade] = (decades[decade] || 0) + (r.gdp || 0);
  });
  const totalGdp = Object.values(decades).reduce((a, b) => a + b, 0);
  const distributionData = Object.entries(decades)
    .slice(-4)
    .map(([name, value]) => ({ name, value: totalGdp ? (value / totalGdp) * 100 : 0 }));

  const growthRanking = nonNull
    .filter((r, i) => i > 0 && nonNull[i - 1].gdp)
    .map((r, i) => ({
      name: r.year,
      value: ((r.gdp - nonNull[i].gdp) / nonNull[i].gdp) * 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const peakGdp = nonNull.reduce((max, r) => (r.gdp > (max?.gdp || 0) ? r : max), null);

  const insights = [
    {
      label: 'GDP Terbaru',
      value: latest.gdp ? `${formatCompact(latest.gdp)} USD (${latest.year})` : '—',
    },
    {
      label: 'GDP Tertinggi',
      value: peakGdp ? `${formatCompact(peakGdp.gdp)} USD tahun ${peakGdp.year}` : '—',
    },
    {
      label: 'Inflasi Terbaru',
      value: latest.inflation ? `${formatPercent(latest.inflation)} (${latest.year})` : '—',
    },
  ];

  const tableData = joined
    .slice()
    .reverse()
    .map((r) => ({
      Tahun: r.year,
      'GDP (USD)': r.gdp ? formatCompact(r.gdp) : '—',
      'GDP per Kapita': r.gdpPerCapita ? formatCompact(r.gdpPerCapita) : '—',
      'Inflasi (%)': r.inflation != null ? formatPercent(r.inflation) : '—',
      Populasi: r.population ? formatCompact(r.population) : '—',
      'Pengangguran (%)': r.unemployment != null ? formatPercent(r.unemployment) : '—',
      _raw: r,
    }));

  return {
    gdp: gdpQ.data || [],
    gdpPerCapita: gdpPcQ.data || [],
    inflation: inflQ.data || [],
    population: popQ.data || [],
    unemployment: unemQ.data || [],
    joined,
    latest,
    distributionData,
    rankingData: growthRanking,
    insights,
    tableData,
    isLoading: gdpQ.isLoading || gdpPcQ.isLoading,
    isError: gdpQ.isError || gdpPcQ.isError,
    error: gdpQ.error || gdpPcQ.error,
    refetch: () => {
      gdpQ.refetch();
      gdpPcQ.refetch();
      inflQ.refetch();
      popQ.refetch();
      unemQ.refetch();
    },
  };
}
