import client from '../lib/apiClient';

const BASE = import.meta.env.VITE_DISEASE_BASE || 'https://disease.sh/v3/covid-19';

const ASEAN_COUNTRIES = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines', 'Vietnam'];

export async function getIndonesiaCurrent() {
  const response = await client.get(`${BASE}/countries/Indonesia`);
  return response.data;
}

export async function getIndonesiaHistorical(lastdays = 'all') {
  const response = await client.get(`${BASE}/historical/Indonesia?lastdays=${lastdays}`);
  const { timeline } = response.data;
  if (!timeline) throw new Error('Format respons historical tidak dikenali');

  const dates = Object.keys(timeline.cases);
  return dates.map((date, i) => {
    const prev = (obj) => (i > 0 ? obj[dates[i - 1]] : 0);
    return {
      date,
      cases: timeline.cases[date],
      deaths: timeline.deaths[date],
      recovered: timeline.recovered[date],
      newCases: Math.max(0, timeline.cases[date] - prev(timeline.cases)),
      newDeaths: Math.max(0, timeline.deaths[date] - prev(timeline.deaths)),
      newRecovered: Math.max(0, timeline.recovered[date] - prev(timeline.recovered)),
    };
  });
}

export async function getASEANComparison() {
  const response = await client.get(`${BASE}/countries?sort=cases`);
  return (response.data || []).filter((c) => ASEAN_COUNTRIES.includes(c.country));
}

export async function getAsiaContinentData() {
  const response = await client.get(`${BASE}/continents/Asia`);
  return response.data;
}
