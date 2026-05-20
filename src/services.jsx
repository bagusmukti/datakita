/* eslint-disable */
/**
 * DataKita — services layer
 *
 * Mirrors src/services/ in the real Vite project. Each public function returns a Promise<T>
 * with normalized response shape so React Query hooks stay simple.
 *
 * apiClient implements the CORS-fallback strategy described in the spec:
 *   1. try direct fetch
 *   2. on network/CORS failure, retry through https://corsproxy.io/?<url>
 *   3. log which strategy succeeded
 */

const CORS_PROXIES = [
  url => 'https://corsproxy.io/?' + encodeURIComponent(url),
  url => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
  url => 'https://api.codetabs.com/v1/proxy/?quest=' + url
];

async function fetchJson(url, { timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function apiClient(url, opts = {}) {
  // 1. direct
  try {
    const data = await fetchJson(url, opts);
    console.debug('[apiClient] direct OK', url);
    return data;
  } catch (e1) {
    console.warn('[apiClient] direct failed, trying CORS proxies:', url, e1.message);
    // 2. proxy fallback chain
    for (const make of CORS_PROXIES) {
      try {
        const data = await fetchJson(make(url), opts);
        console.debug('[apiClient] proxy OK (' + make(url).split('?')[0] + ')', url);
        return data;
      } catch (e2) {
        console.warn('[apiClient] proxy attempt failed:', make(url).split('?')[0], e2.message);
      }
    }
    console.warn('[apiClient] all strategies failed', url);
    throw new Error('Gagal mengambil data dari sumber: ' + url);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 1. BMKG — Gempa & Cuaca
 * ─────────────────────────────────────────────────────────────────────── */
const BMKG = 'https://data.bmkg.go.id/DataMKG/TEWS/';

function parseGempa(g) {
  const [lat, lon] = (g.Coordinates || ',').split(',').map(parseFloat);
  return {
    tanggal: g.Tanggal,
    jam: g.Jam,
    dateTime: g.DateTime,
    magnitude: parseFloat(g.Magnitude),
    kedalaman: parseFloat((g.Kedalaman || '').replace(/[^\d.]/g, '')),
    kedalamanRaw: g.Kedalaman,
    wilayah: g.Wilayah,
    potensi: g.Potensi || g.Dirasakan || '—',
    lat, lon,
    lintang: g.Lintang,
    bujur: g.Bujur
  };
}

const bmkgService = {
  async getLatestEarthquake() {
    const d = await apiClient(BMKG + 'autogempa.json');
    return parseGempa(d.Infogempa.gempa);
  },
  async getRecentEarthquakes() {
    const d = await apiClient(BMKG + 'gempaterkini.json');
    return (d.Infogempa.gempa || []).map(parseGempa);
  },
  async getFeltEarthquakes() {
    const d = await apiClient(BMKG + 'gempadirasakan.json');
    return (d.Infogempa.gempa || []).map(parseGempa);
  },
  async getWeatherForecast(adm1 = '31') {
    // Note: BMKG cuaca endpoint structure is large; we keep this for parity with the spec.
    return apiClient(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm1=${adm1}`);
  }
};

/* ──────────────────────────────────────────────────────────────────────────
 * 2. World Bank — Indikator Ekonomi Indonesia
 * ─────────────────────────────────────────────────────────────────────── */
const WB = 'https://api.worldbank.org/v2/country/IDN/indicator/';

async function wbIndicator(code, { perPage = 60 } = {}) {
  const url = `${WB}${code}?format=json&per_page=${perPage}`;
  const raw = await apiClient(url);
  // raw is [meta, dataArray]
  const series = Array.isArray(raw) && raw[1] ? raw[1] : [];
  return series
    .filter(r => r && r.value != null)
    .map(r => ({ year: parseInt(r.date, 10), value: r.value, indicator: r.indicator?.value }))
    .sort((a, b) => a.year - b.year);
}

const worldBankService = {
  getGDP:          () => wbIndicator('NY.GDP.MKTP.CD'),
  getGDPPerCapita: () => wbIndicator('NY.GDP.PCAP.CD'),
  getInflation:    () => wbIndicator('FP.CPI.TOTL.ZG'),
  getPopulation:   () => wbIndicator('SP.POP.TOTL'),
  getUnemployment: () => wbIndicator('SL.UEM.TOTL.ZS')
};

/* ──────────────────────────────────────────────────────────────────────────
 * 3. disease.sh — Indonesia COVID-19 historical (CORS-friendly, no key)
 *    Replaces the old data.covid19.go.id endpoint which began rejecting
 *    cross-origin requests post-endemi.
 * ─────────────────────────────────────────────────────────────────────── */
const DISEASE = 'https://disease.sh/v3/covid-19/';
const ASEAN = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines', 'Vietnam'];

function parseHistoricalKey(k) {
  // disease.sh date keys look like "5/15/26"  →  Date(2026, 4, 15)
  const [m, d, y] = k.split('/').map(Number);
  const year = y < 50 ? 2000 + y : 1900 + y;
  return new Date(year, m - 1, d);
}

function timelineToArray(timeline) {
  const dates = Object.keys(timeline.cases || {});
  const rows = dates.map(k => ({
    key: k,
    date: parseHistoricalKey(k),
    cases:     timeline.cases?.[k]     ?? 0,
    deaths:    timeline.deaths?.[k]    ?? 0,
    recovered: timeline.recovered?.[k] ?? 0
  })).sort((a, b) => a.date - b.date);

  // diff cumulative → daily
  for (let i = 0; i < rows.length; i++) {
    const prev = rows[i - 1];
    rows[i].newCases     = Math.max(0, rows[i].cases     - (prev?.cases     ?? 0));
    rows[i].newDeaths    = Math.max(0, rows[i].deaths    - (prev?.deaths    ?? 0));
    rows[i].newRecovered = Math.max(0, rows[i].recovered - (prev?.recovered ?? 0));
  }
  return rows;
}

const diseaseService = {
  async getIndonesiaCurrent() {
    return apiClient(DISEASE + 'countries/Indonesia');
  },
  async getIndonesiaHistorical(lastdays = 'all') {
    const d = await apiClient(`${DISEASE}historical/Indonesia?lastdays=${lastdays}`);
    return timelineToArray(d.timeline || d);
  },
  async getASEANComparison() {
    const all = await apiClient(DISEASE + 'countries?sort=cases');
    return all.filter(c => ASEAN.includes(c.country));
  },
  async getAsiaContinentData() {
    return apiClient(DISEASE + 'continents/Asia');
  }
};

/* ──────────────────────────────────────────────────────────────────────────
 * Tiny React Query–style cache (prototype). Real app uses @tanstack/react-query.
 * Same external shape: { data, isLoading, isError, error, refetch }.
 * ─────────────────────────────────────────────────────────────────────── */
const __qcache = new Map(); // key -> { data, t, promise }
const STALE_MS = 5 * 60 * 1000;

function useQuery(key, fn, { enabled = true } = {}) {
  const k = JSON.stringify(key);
  const [, force] = React.useReducer(x => x + 1, 0);
  const stateRef = React.useRef({ data: null, isLoading: false, isError: false, error: null });

  const run = React.useCallback(async (bypassCache = false) => {
    if (!enabled) return;
    const cached = __qcache.get(k);
    if (!bypassCache && cached && Date.now() - cached.t < STALE_MS) {
      stateRef.current = { data: cached.data, isLoading: false, isError: false, error: null };
      force();
      return;
    }
    stateRef.current = { ...stateRef.current, isLoading: true, isError: false, error: null };
    force();
    try {
      const data = await fn();
      __qcache.set(k, { data, t: Date.now() });
      stateRef.current = { data, isLoading: false, isError: false, error: null };
    } catch (e) {
      stateRef.current = { data: null, isLoading: false, isError: true, error: e };
    }
    force();
  }, [k, enabled]);

  React.useEffect(() => { run(false); }, [run]);

  return { ...stateRef.current, refetch: () => run(true) };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Dataset-bound hooks (mirror src/hooks/use*Data.js)
 * ─────────────────────────────────────────────────────────────────────── */
function useBmkgData() {
  const latest = useQuery(['bmkg', 'latest'],  bmkgService.getLatestEarthquake);
  const recent = useQuery(['bmkg', 'recent'],  bmkgService.getRecentEarthquakes);
  const felt   = useQuery(['bmkg', 'felt'],    bmkgService.getFeltEarthquakes);
  return { latest, recent, felt };
}

function useWorldBankData() {
  const gdp        = useQuery(['wb', 'gdp'],        worldBankService.getGDP);
  const gdpPc      = useQuery(['wb', 'gdpPc'],      worldBankService.getGDPPerCapita);
  const inflation  = useQuery(['wb', 'inflation'],  worldBankService.getInflation);
  const population = useQuery(['wb', 'population'], worldBankService.getPopulation);
  const unemp      = useQuery(['wb', 'unemp'],      worldBankService.getUnemployment);
  return { gdp, gdpPc, inflation, population, unemp };
}

function useDiseaseData() {
  const current    = useQuery(['disease', 'current'],    diseaseService.getIndonesiaCurrent);
  const historical = useQuery(['disease', 'historical'], () => diseaseService.getIndonesiaHistorical('all'));
  const asean      = useQuery(['disease', 'asean'],      diseaseService.getASEANComparison);
  const asia       = useQuery(['disease', 'asia'],       diseaseService.getAsiaContinentData);
  return { current, historical, asean, asia };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Formatters (lib/utils.js)
 * ─────────────────────────────────────────────────────────────────────── */
const fmtID = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtTimeID = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });
const nfID = new Intl.NumberFormat('id-ID');

function formatDateID(d) { try { return fmtID.format(new Date(d)); } catch { return d || '—'; } }
function formatNumber(n, opts) {
  if (n == null || Number.isNaN(n)) return '—';
  if (opts?.compact) return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
  if (opts?.decimals != null) return new Intl.NumberFormat('id-ID', { maximumFractionDigits: opts.decimals, minimumFractionDigits: opts.decimals }).format(n);
  return nfID.format(Math.round(n));
}
function formatCurrencyUSD(n) {
  if (n == null) return '—';
  return '$' + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}
function cn(...args) {
  return args.flat().filter(Boolean).join(' ');
}

Object.assign(window, {
  apiClient, bmkgService, worldBankService, diseaseService,
  useQuery, useBmkgData, useWorldBankData, useDiseaseData,
  formatDateID, formatNumber, formatCurrencyUSD, cn
});
