import client from '../lib/apiClient';

const WB_BASE = import.meta.env.VITE_WORLDBANK_BASE || 'https://api.worldbank.org/v2';

function parseResponse(responseData) {
  const [, data] = responseData;
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.value !== null && item.value !== undefined)
    .sort((a, b) => parseInt(a.date) - parseInt(b.date))
    .map((item) => ({
      year: item.date,
      value: item.value,
      country: item.country?.value,
      indicator: item.indicator?.value,
    }));
}

async function fetchIndicator(indicator, perPage = 60) {
  const response = await client.get(
    `${WB_BASE}/country/IDN/indicator/${indicator}?format=json&per_page=${perPage}`
  );
  return parseResponse(response.data);
}

export const getGDP = () => fetchIndicator('NY.GDP.MKTP.CD');
export const getGDPPerCapita = () => fetchIndicator('NY.GDP.PCAP.CD');
export const getInflation = () => fetchIndicator('FP.CPI.TOTL.ZG');
export const getPopulation = () => fetchIndicator('SP.POP.TOTL');
export const getUnemployment = () => fetchIndicator('SL.UEM.TOTL.ZS');

export function joinByYear(gdp, gdpPerCapita, inflation, population, unemployment) {
  const allYears = [
    ...new Set([
      ...(gdp || []).map((d) => d.year),
      ...(gdpPerCapita || []).map((d) => d.year),
    ]),
  ].sort((a, b) => parseInt(a) - parseInt(b));

  const lookup = (arr, year) => arr?.find((d) => d.year === year)?.value ?? null;

  return allYears.map((year) => ({
    year,
    gdp: lookup(gdp, year),
    gdpPerCapita: lookup(gdpPerCapita, year),
    inflation: lookup(inflation, year),
    population: lookup(population, year),
    unemployment: lookup(unemployment, year),
  }));
}
