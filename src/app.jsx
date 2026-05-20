/* eslint-disable */
/**
 * DataKita — app shell + dataset → viewData projections
 *
 * The single source of truth for "what gets shown" lives here. Each dataset is
 * fetched via its React-Query-style hooks, then projected into a uniform
 * viewData object that HeroHeader / FeaturedChart / DistributionChart /
 * RankingChart / InsightsCard / DataTable all consume.
 */

const PALETTE_APP = window.PALETTE;

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers shared across projections
 * ─────────────────────────────────────────────────────────────────────── */
function bmkgRegion(wilayah) {
  if (!wilayah) return 'Tidak diketahui';
  // best-effort: last token, drop trailing punctuation
  const tokens = wilayah.replace(/[,.]/g, '').trim().split(/\s+/);
  return tokens.slice(-1)[0];
}
function depthCategory(km) {
  if (km == null || Number.isNaN(km)) return 'Tidak diketahui';
  if (km < 60) return 'Dangkal';
  if (km <= 300) return 'Menengah';
  return 'Dalam';
}
function tally(arr, keyFn) {
  const m = new Map();
  arr.forEach(x => { const k = keyFn(x); m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].map(([key, value]) => ({ key, value }));
}

/* ──────────────────────────────────────────────────────────────────────────
 * BMKG projection
 * ─────────────────────────────────────────────────────────────────────── */
function projectBmkg({ latest, recent, felt }, filters) {
  const loading = latest.isLoading || recent.isLoading;
  const error   = latest.isError && recent.isError;
  const errorMessage = 'Gagal memuat data gempa dari BMKG.';
  const refetch = () => { latest.refetch(); recent.refetch(); felt.refetch(); };

  let rows = recent.data || [];

  // apply filters
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(r => (r.wilayah + ' ' + r.magnitude + ' ' + r.kedalaman).toLowerCase().includes(q));
  }
  if (filters.category && filters.category !== 'Semua') {
    rows = rows.filter(r => {
      const cat = depthCategory(r.kedalaman);
      return filters.category.startsWith('Dangkal') ? cat === 'Dangkal'
           : filters.category.startsWith('Menengah') ? cat === 'Menengah'
           : filters.category.startsWith('Dalam')   ? cat === 'Dalam' : true;
    });
  }

  const featuredData = [...rows].reverse().map((r, i) => ({
    label: r.jam || `#${i + 1}`,
    magnitude: r.magnitude
  }));

  const depthTally = [
    { label: 'Dangkal (<60km)',    value: rows.filter(r => depthCategory(r.kedalaman) === 'Dangkal').length,  color: PALETTE_APP.accent },
    { label: 'Menengah (60–300km)', value: rows.filter(r => depthCategory(r.kedalaman) === 'Menengah').length, color: PALETTE_APP.primary },
    { label: 'Dalam (>300km)',     value: rows.filter(r => depthCategory(r.kedalaman) === 'Dalam').length,    color: PALETTE_APP.supporting }
  ];

  const ranking = tally(rows, r => bmkgRegion(r.wilayah))
    .sort((a, b) => b.value - a.value).slice(0, 5)
    .map(x => ({ label: x.key, value: x.value }));

  // Insights
  const maxQuake = rows.reduce((m, r) => (!m || r.magnitude > m.magnitude ? r : m), null);
  const sigCount = rows.filter(r => r.magnitude >= 5).length;
  const insights = [
    maxQuake && {
      icon: 'Zap', tone: 'red',
      eyebrow: 'Gempa terbesar tercatat',
      body: <>M<span className="font-mono font-semibold">{maxQuake.magnitude.toFixed(1)}</span> di <span className="font-semibold">{bmkgRegion(maxQuake.wilayah)}</span> · kedalaman <span className="font-mono">{maxQuake.kedalamanRaw}</span></>
    },
    {
      icon: 'AlertOctagon', tone: 'amber',
      eyebrow: 'Ambang signifikan',
      body: <><span className="font-mono font-semibold">{sigCount}</span> dari {rows.length} event terkini berada di magnitude ≥ 5.0</>
    },
    latest.data && {
      icon: 'Radio', tone: 'green',
      eyebrow: 'Event terakhir',
      body: <>M<span className="font-mono font-semibold">{latest.data.magnitude.toFixed(1)}</span> · {latest.data.wilayah?.slice(0, 64)}…</>
    }
  ].filter(Boolean);

  const stats = [
    { eyebrow: 'Event 24 jam', value: rows.length, unit: 'event', hint: 'BMKG · gempaterkini.json', tone: 'indigo' },
    { eyebrow: 'M ≥ 5.0',      value: sigCount,    unit: 'event', hint: 'Ambang signifikan',          tone: 'amber'  },
    { eyebrow: 'Last update',  value: latest.data ? latest.data.jam : '—', unit: 'WIB', hint: latest.data?.tanggal || '—', tone: 'green' }
  ];

  return {
    loading, error, errorMessage, refetch,
    rowCount: rows.length,
    stats,
    featured: {
      title: 'Magnitude 15 Event Terkini',
      subtitle: 'Garis horizontal menandai ambang batas signifikan M5.0',
      sourceLabel: 'BMKG TEWS',
      endpoint: 'data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
      footer: 'Time-series · sumbu X = waktu lokal · diperbarui realtime',
      data: featuredData,
      xKey: 'label',
      yFormat: v => 'M' + Number(v).toFixed(1),
      series: [{ key: 'magnitude', label: 'Magnitude', color: PALETTE_APP.primary }],
      reference: { y: 5.0, label: 'Ambang batas signifikan M5.0' },
      defaultType: 'line',
      allowed: ['line', 'bar', 'area']
    },
    distribution: { title: 'Distribusi Kedalaman', subtitle: 'Klasifikasi geofisika', badge: 'Depth', hint: 'Klasifikasi standar BMKG', data: depthTally },
    ranking:      { title: 'Wilayah Paling Aktif', subtitle: 'Frekuensi event dari 15 terkini', hint: 'Wilayah disarikan dari medan Wilayah BMKG', data: ranking },
    insights,
    table: {
      title: 'Gempa Terkini',
      exportSlug: 'bmkg_gempa',
      rows,
      columns: [
        { key: 'tanggal',   label: 'Tanggal' },
        { key: 'jam',       label: 'Waktu', mono: true },
        { key: 'magnitude', label: 'Magnitude', mono: true,
          render: r => <span className={cn('font-mono', r.magnitude >= 5 ? 'text-red-700 font-semibold' : 'text-ink')}>M{r.magnitude.toFixed(1)}</span> },
        { key: 'kedalamanRaw', label: 'Kedalaman', mono: true },
        { key: 'wilayah',   label: 'Lokasi', render: r => <span className="block max-w-[280px] truncate" title={r.wilayah}>{r.wilayah}</span> },
        { key: 'coords',    label: 'Koordinat', mono: true, accessor: r => `${r.lat?.toFixed(2)}, ${r.lon?.toFixed(2)}` },
        { key: 'potensi',   label: 'Potensi Tsunami',
          render: r => <Badge tone={String(r.potensi).toLowerCase().includes('tidak') ? 'green' : 'red'}>{r.potensi}</Badge> }
      ]
    }
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * World Bank projection
 * ─────────────────────────────────────────────────────────────────────── */
const WB_INDICATORS = {
  'GDP':           { key: 'gdp',        label: 'GDP (USD)',           format: formatCurrencyUSD },
  'GDP per Kapita':{ key: 'gdpPc',      label: 'GDP per Kapita (USD)', format: formatCurrencyUSD },
  'Inflasi':       { key: 'inflation',  label: 'Inflasi (%)',          format: v => v?.toFixed(2) + '%' },
  'Populasi':      { key: 'population', label: 'Populasi',             format: v => formatNumber(v, { compact: true }) },
  'Pengangguran':  { key: 'unemp',      label: 'Pengangguran (%)',     format: v => v?.toFixed(2) + '%' }
};

function projectWB(qs, filters, indicator) {
  const loading = Object.values(qs).some(q => q.isLoading && !q.data);
  const error   = Object.values(qs).every(q => q.isError);
  const errorMessage = 'Gagal memuat indikator dari World Bank.';
  const refetch = () => Object.values(qs).forEach(q => q.refetch());

  const ind = WB_INDICATORS[indicator] || WB_INDICATORS['GDP'];
  const series = qs[ind.key]?.data || [];

  // joined rows by year
  const byYear = {};
  Object.entries(WB_INDICATORS).forEach(([_, def]) => {
    (qs[def.key]?.data || []).forEach(r => {
      byYear[r.year] = byYear[r.year] || { year: r.year };
      byYear[r.year][def.key] = r.value;
    });
  });
  let rows = Object.values(byYear).sort((a, b) => b.year - a.year);

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(r => String(r.year).includes(q));
  }
  if (filters.decade && filters.decade !== 'Semua') {
    const dec = parseInt(filters.decade, 10); // e.g. 1960
    rows = rows.filter(r => r.year >= dec && r.year < dec + 10);
  }

  // featured chart data
  let chartData = [...series].sort((a, b) => a.year - b.year);
  if (filters.decade && filters.decade !== 'Semua') {
    const dec = parseInt(filters.decade, 10);
    chartData = chartData.filter(r => r.year >= dec && r.year < dec + 10);
  }
  const featuredData = chartData.map(r => ({ year: r.year, value: r.value }));

  // GDP growth share by decade (donut)
  const gdpSeries = qs.gdp.data || [];
  const decades = {};
  for (let i = 1; i < gdpSeries.length; i++) {
    const prev = gdpSeries[i - 1], cur = gdpSeries[i];
    if (prev?.value && cur?.value) {
      const growth = Math.max(0, cur.value - prev.value);
      const dec = Math.floor(cur.year / 10) * 10;
      decades[dec] = (decades[dec] || 0) + growth;
    }
  }
  const decadeColors = ['#1E2761', '#3a458f', '#5a64a7', '#A8C5E0', '#F5A623', '#e89713', '#16A34A'];
  const dist = Object.entries(decades)
    .sort((a, b) => +a[0] - +b[0])
    .map(([dec, v], i) => ({ label: dec + '-an', value: v, color: decadeColors[i % decadeColors.length] }));

  // Top 5 highest growth years (relative GDP growth)
  const growths = [];
  for (let i = 1; i < gdpSeries.length; i++) {
    const prev = gdpSeries[i - 1], cur = gdpSeries[i];
    if (prev?.value && cur?.value) growths.push({ year: cur.year, growth: ((cur.value - prev.value) / prev.value) * 100 });
  }
  const ranking = growths.sort((a, b) => b.growth - a.growth).slice(0, 5)
    .map(g => ({ label: 'Tahun ' + g.year, value: g.growth }));

  // Insights
  const latestGdp  = gdpSeries[gdpSeries.length - 1];
  const peakGdp    = gdpSeries.reduce((m, r) => (!m || r.value > m.value ? r : m), null);
  const inflLatest = (qs.inflation.data || []).slice(-1)[0];
  const popLatest  = (qs.population.data || []).slice(-1)[0];

  const insights = [
    peakGdp && {
      icon: 'TrendingUp', tone: 'green',
      eyebrow: 'PDB tertinggi tercatat',
      body: <>Tahun <span className="font-mono font-semibold">{peakGdp.year}</span> · {formatCurrencyUSD(peakGdp.value)} (current US$)</>
    },
    inflLatest && {
      icon: 'Flame', tone: inflLatest.value > 5 ? 'amber' : 'green',
      eyebrow: 'Inflasi terkini',
      body: <><span className="font-mono font-semibold">{inflLatest.value.toFixed(2)}%</span> ({inflLatest.year}) · CPI tahunan</>
    },
    popLatest && {
      icon: 'Users', tone: 'indigo',
      eyebrow: 'Populasi',
      body: <><span className="font-mono font-semibold">{formatNumber(popLatest.value, { compact: true })}</span> jiwa ({popLatest.year})</>
    }
  ].filter(Boolean);

  const stats = [
    { eyebrow: 'GDP Terkini', value: latestGdp ? formatCurrencyUSD(latestGdp.value) : '—', hint: latestGdp ? `Tahun ${latestGdp.year}` : '', tone: 'indigo' },
    { eyebrow: 'Inflasi',     value: inflLatest ? inflLatest.value.toFixed(2) : '—', unit: '%', hint: inflLatest ? `CPI ${inflLatest.year}` : '', tone: 'amber' },
    { eyebrow: 'Populasi',    value: popLatest ? formatNumber(popLatest.value, { compact: true }) : '—', unit: 'jiwa', hint: popLatest ? `Tahun ${popLatest.year}` : '', tone: 'green' }
  ];

  return {
    loading, error, errorMessage, refetch,
    rowCount: rows.length,
    stats,
    featured: {
      title: ind.label + ' Indonesia · Time-series',
      subtitle: 'Pilih indikator dari dropdown · sumbu X = tahun · data 1960–sekarang',
      sourceLabel: 'World Bank',
      endpoint: 'api.worldbank.org/v2/country/IDN/indicator/',
      footer: 'Series tahunan · null values dikecualikan otomatis',
      data: featuredData,
      xKey: 'year',
      yFormat: v => indicator === 'GDP' || indicator === 'GDP per Kapita' ? formatCurrencyUSD(v)
                  : indicator === 'Populasi' ? formatNumber(v, { compact: true })
                  : Number(v).toFixed(2) + '%',
      series: [{ key: 'value', label: ind.label, color: PALETTE_APP.primary }],
      defaultType: 'line',
      allowed: ['line', 'bar', 'area']
    },
    distribution: { title: 'Pertumbuhan GDP per Dekade', subtitle: 'Akumulasi tambahan PDB per dekade (USD)', badge: 'Dekade', hint: 'Δ GDP per tahun, dikumulasikan per dekade', data: dist },
    ranking:      { title: 'Tahun Pertumbuhan Tertinggi', subtitle: 'Top 5 berdasarkan % growth tahunan PDB', hint: 'Δ% tahun-ke-tahun', data: ranking, format: v => v.toFixed(1) + '%' },
    insights,
    table: {
      title: 'Indikator Ekonomi Indonesia',
      exportSlug: 'worldbank_indikator',
      rows,
      columns: [
        { key: 'year',       label: 'Tahun', mono: true },
        { key: 'gdp',        label: 'GDP (USD)', mono: true, render: r => formatCurrencyUSD(r.gdp), accessor: r => r.gdp },
        { key: 'gdpPc',      label: 'GDP per Kapita', mono: true, render: r => formatCurrencyUSD(r.gdpPc), accessor: r => r.gdpPc },
        { key: 'inflation',  label: 'Inflasi (%)', mono: true, render: r => r.inflation != null ? r.inflation.toFixed(2) + '%' : '—', accessor: r => r.inflation },
        { key: 'population', label: 'Populasi', mono: true, render: r => formatNumber(r.population), accessor: r => r.population },
        { key: 'unemp',      label: 'Pengangguran (%)', mono: true, render: r => r.unemp != null ? r.unemp.toFixed(2) + '%' : '—', accessor: r => r.unemp }
      ]
    }
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * disease.sh (COVID-19 Indonesia) projection
 * ─────────────────────────────────────────────────────────────────────── */
function projectDisease({ current, historical, asean, asia }, filters) {
  const loading = current.isLoading || historical.isLoading;
  const error   = current.isError && historical.isError;
  const errorMessage = 'Gagal memuat data COVID-19 dari disease.sh.';
  const refetch = () => { current.refetch(); historical.refetch(); asean.refetch(); asia.refetch(); };

  const cur = current.data || {};
  const hist = historical.data || [];

  // Build table rows (newest first)
  let rows = [...hist].reverse().map(r => ({
    date: r.date,
    dateKey: r.key,
    newCases: r.newCases,
    newDeaths: r.newDeaths,
    newRecovered: r.newRecovered,
    cumCases: r.cases,
    cumDeaths: r.deaths,
    cumRecovered: r.recovered
  }));

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(r => r.dateKey.toLowerCase().includes(q));
  }
  if (filters.phase && filters.phase !== 'Semua') {
    const phase = filters.phase;
    rows = rows.filter(r => {
      const y = r.date.getFullYear();
      if (phase.includes('2020')) return y === 2020;
      if (phase.includes('2021')) return y === 2021;
      if (phase.includes('2022')) return y === 2022;
      if (phase.includes('2023')) return y >= 2023;
      return true;
    });
  }

  // Featured chart: stride-sample to ~200 points
  const stride = Math.max(1, Math.floor(hist.length / 200));
  const featuredData = hist.filter((_, i) => i % stride === 0).map(d => ({
    date: `${String(d.date.getMonth() + 1).padStart(2, '0')}/${String(d.date.getFullYear()).slice(-2)}`,
    positif: d.newCases,
    sembuh: d.newRecovered,
    meninggal: d.newDeaths
  }));

  const totPos = cur.cases ?? 0;
  const totSem = cur.recovered ?? 0;
  const totMen = cur.deaths ?? 0;
  const active = cur.active ?? Math.max(0, totPos - totSem - totMen);

  const dist = [
    { label: 'Sembuh',    value: totSem, color: PALETTE_APP.green  },
    { label: 'Aktif',     value: active, color: PALETTE_APP.accent },
    { label: 'Meninggal', value: totMen, color: PALETTE_APP.red    }
  ];

  // ASEAN ranking by casesPerOneMillion
  const aseanRows = (asean.data || [])
    .slice()
    .sort((a, b) => (b.casesPerOneMillion || 0) - (a.casesPerOneMillion || 0))
    .map(c => ({ label: c.country, value: c.casesPerOneMillion || 0 }));

  // Find peak day
  const peak = hist.reduce((m, d) => (!m || d.newCases > m.newCases ? d : m), null);
  const indoIdx = aseanRows.findIndex(r => r.label === 'Indonesia');

  const insights = [
    peak && peak.newCases > 0 && {
      icon: 'AlertOctagon', tone: 'red',
      eyebrow: 'Puncak kasus harian',
      body: <><span className="font-mono font-semibold">{formatNumber(peak.newCases)}</span> kasus pada <span className="font-mono">{peak.date.toLocaleDateString('id-ID')}</span></>
    },
    totPos > 0 && {
      icon: 'HeartPulse', tone: 'green',
      eyebrow: 'Tingkat kesembuhan',
      body: <><span className="font-mono font-semibold">{((totSem / totPos) * 100).toFixed(2)}%</span> dari total kasus terkonfirmasi</>
    },
    indoIdx >= 0 && aseanRows.length > 0 && {
      icon: 'Globe2', tone: 'indigo',
      eyebrow: 'Peringkat ASEAN',
      body: <>Indonesia menempati peringkat <span className="font-mono font-semibold">#{indoIdx + 1}</span> dari {aseanRows.length} negara ASEAN dalam kasus per juta penduduk</>
    }
  ].filter(Boolean);

  const stats = [
    { eyebrow: 'Total Kasus',     value: formatNumber(totPos, { compact: true }), unit: 'kasus', hint: 'disease.sh · countries/Indonesia', tone: 'indigo' },
    { eyebrow: 'Total Sembuh',    value: formatNumber(totSem, { compact: true }), unit: 'kasus', hint: 'Akumulatif nasional',              tone: 'green'  },
    { eyebrow: 'Total Meninggal', value: formatNumber(totMen, { compact: true }), unit: 'kasus', hint: 'Akumulatif nasional',              tone: 'red'    }
  ];

  return {
    loading, error, errorMessage, refetch,
    rowCount: rows.length,
    stats,
    featured: {
      title: 'Kasus Harian COVID-19 · Nasional',
      subtitle: 'Stacked area · kasus baru vs sembuh vs meninggal · 2020–arsip terkini',
      sourceLabel: 'disease.sh',
      endpoint: 'disease.sh/v3/covid-19/historical/Indonesia',
      footer: 'Time-series · daily new = Δ akumulatif · disease.sh',
      data: featuredData,
      xKey: 'date',
      yFormat: v => formatNumber(v, { compact: true }),
      series: [
        { key: 'positif',   label: 'Kasus baru',     color: PALETTE_APP.accent },
        { key: 'sembuh',    label: 'Sembuh baru',    color: PALETTE_APP.green  },
        { key: 'meninggal', label: 'Meninggal baru', color: PALETTE_APP.red    }
      ],
      defaultType: 'area',
      stack: true,
      allowed: ['line', 'bar', 'area']
    },
    distribution: { title: 'Komposisi Saat Ini',         subtitle: 'Sembuh · Aktif · Meninggal',     badge: 'Status', hint: 'cur.active = positif − (sembuh + meninggal)', data: dist },
    ranking:      { title: 'Perbandingan ASEAN',          subtitle: 'Kasus per juta penduduk · 6 negara', hint: 'disease.sh /countries · per-million normalisasi', data: aseanRows, format: v => formatNumber(v, { compact: true }) },
    insights,
    table: {
      title: 'Catatan Harian Nasional',
      exportSlug: 'covid_indonesia',
      rows,
      columns: [
        { key: 'dateKey',      label: 'Tanggal',         mono: true },
        { key: 'newCases',     label: 'Kasus Baru',      mono: true, render: r => formatNumber(r.newCases),                                                  accessor: r => r.newCases },
        { key: 'newRecovered', label: 'Sembuh Baru',     mono: true, render: r => formatNumber(r.newRecovered),                                              accessor: r => r.newRecovered },
        { key: 'newDeaths',    label: 'Meninggal Baru',  mono: true, render: r => <span className="text-red-700 font-mono">{formatNumber(r.newDeaths)}</span>, accessor: r => r.newDeaths },
        { key: 'cumCases',     label: 'Akum. Kasus',     mono: true, render: r => formatNumber(r.cumCases),                                                  accessor: r => r.cumCases },
        { key: 'cumRecovered', label: 'Akum. Sembuh',    mono: true, render: r => formatNumber(r.cumRecovered),                                              accessor: r => r.cumRecovered },
        { key: 'cumDeaths',    label: 'Akum. Meninggal', mono: true, render: r => formatNumber(r.cumDeaths),                                                 accessor: r => r.cumDeaths }
      ]
    }
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Dashboard route
 * ─────────────────────────────────────────────────────────────────────── */
function Dashboard({ dataset }) {
  const bmkg    = useBmkgData();
  const wb      = useWorldBankData();
  const disease = useDiseaseData();

  const [filters, setFilters] = React.useState({});
  const [indicator, setIndicator] = React.useState('GDP');
  const [exportOpen, setExportOpen] = React.useState(false);
  const dashboardRef = React.useRef(null);
  const searchRef    = React.useRef(null);

  // reset filters on dataset switch
  React.useEffect(() => { setFilters({}); }, [dataset]);

  // keyboard shortcuts
  React.useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === 'e') { setExportOpen(o => !o); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const viewData = React.useMemo(() => {
    if (dataset === 'bmkg')  return projectBmkg(bmkg, filters);
    if (dataset === 'wb')    return projectWB(wb, filters, indicator);
    if (dataset === 'covid') return projectDisease(disease, filters);
    return null;
  }, [dataset, bmkg.latest.data, bmkg.recent.data, bmkg.felt.data,
      wb.gdp.data, wb.gdpPc.data, wb.inflation.data, wb.population.data, wb.unemp.data,
      disease.current.data, disease.historical.data, disease.asean.data, disease.asia.data,
      filters, indicator,
      bmkg.latest.isLoading, bmkg.recent.isLoading, wb.gdp.isLoading, wb.inflation.isLoading,
      disease.current.isLoading, disease.historical.isLoading]);

  if (!viewData) return null;

  return (
    <div ref={dashboardRef}>
      <HeroHeader dataset={dataset} viewData={viewData} />
      <FilterBar dataset={dataset} filters={filters} setFilters={setFilters}
                 onExport={() => setExportOpen(true)} viewData={viewData} searchRef={searchRef} />

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <FeaturedChart viewData={viewData} dataset={dataset} indicator={indicator} setIndicator={setIndicator} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DistributionChart viewData={viewData} />
          <RankingChart      viewData={viewData} />
          <InsightsCard      viewData={viewData} />
        </div>

        <DataTable viewData={viewData}
          onView={row => alert('Detail baris:\n' + JSON.stringify(row, null, 2))}
          onCopy={row => { navigator.clipboard.writeText(JSON.stringify(row, null, 2)); }} />

        <DatasetDisclosure dataset={dataset} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[12px] text-ink-muted">
          <div className="flex items-center gap-3">
            <span>Pintasan keyboard:</span>
            <span className="inline-flex items-center gap-1.5"><kbd>/</kbd> fokus pencarian</span>
            <span className="inline-flex items-center gap-1.5"><kbd>E</kbd> buka export</span>
            <span className="inline-flex items-center gap-1.5"><kbd>Esc</kbd> tutup modal</span>
          </div>
          <div className="font-mono">datakita · {dataset}</div>
        </div>
      </main>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)}
                   viewData={viewData} dataset={dataset} dashboardRef={dashboardRef} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * App shell + router
 * ─────────────────────────────────────────────────────────────────────── */
function App() {
  const [route, setRoute]     = React.useState(() => (window.location.hash || '#dashboard').replace('#', ''));
  const [dataset, setDataset] = React.useState('bmkg');

  React.useEffect(() => {
    function sync() { setRoute((window.location.hash || '#dashboard').replace('#', '')); }
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  React.useEffect(() => { window.location.hash = route; }, [route]);

  // shared "API status" derived from active dataset's hooks (probed lightly via Dashboard)
  const bmkg    = useBmkgData();
  const wb      = useWorldBankData();
  const disease = useDiseaseData();
  const map = { bmkg, wb, covid: disease };
  const active = map[dataset];
  const anyLoading = Object.values(active).some(q => q.isLoading);
  const anyError   = Object.values(active).every(q => q.isError);
  const apiStatus  = anyError ? 'error' : anyLoading ? 'pending' : 'ok';

  // For Datasets page card timestamps
  const status = {
    bmkg:  { updated: bmkg.latest.data?.jam ? `Hari ini · ${bmkg.latest.data.jam}` : 'Realtime' },
    wb:    { updated: (wb.gdp.data?.slice(-1)[0]?.year || '—') + ' (terbaru)' },
    covid: { updated: disease.current.data?.updated ? new Date(disease.current.data.updated).toLocaleDateString('id-ID') : 'Realtime' }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar route={route} setRoute={setRoute} dataset={dataset} setDataset={setDataset} apiStatus={apiStatus} />
      <div className="flex-1">
        {route === 'dashboard' && <Dashboard dataset={dataset} />}
        {route === 'datasets'  && <DatasetsPage setRoute={setRoute} setDataset={setDataset} status={status} />}
        {route === 'about'     && <AboutPage />}
        {route === 'api-docs'  && <ApiDocsPage />}
      </div>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
