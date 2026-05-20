/* eslint-disable */
/**
 * DataKita — dashboard surface
 *
 * HeroHeader, FilterBar, FeaturedChart, DistributionChart, RankingChart,
 * InsightsCard, DataTable, ExportModal, ErrorState, EmptyState.
 *
 * Each dataset projects into a common viewData shape so charts/table stay agnostic.
 */

const R = window.Recharts || {};
const {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip: RcTooltip, ReferenceLine, Legend
} = R;

const PALETTE = {
  primary:   '#1E2761',
  accent:    '#F5A623',
  supporting:'#A8C5E0',
  green:     '#16A34A',
  red:       '#DC2626',
  amber:     '#EAB308',
  slate:     '#6B7280'
};

/* ──────────────────────────────────────────────────────────────────────────
 * HeroHeader
 * ─────────────────────────────────────────────────────────────────────── */
function HeroHeader({ dataset, viewData, lastUpdate }) {
  const ds = DATASETS.find(d => d.id === dataset);
  const titles = {
    bmkg:  'Cuaca & Aktivitas Seismik Indonesia',
    wb:    'Indikator Ekonomi Indonesia',
    covid: 'Data Historis COVID-19 Indonesia'
  };
  const sources = {
    bmkg:  'Sumber: BMKG · data.bmkg.go.id · diperbarui realtime',
    wb:    'Sumber: World Bank Open Data · api.worldbank.org · 1960–sekarang',
    covid: 'Sumber: disease.sh · COVID-19 Indonesia Historical Data · diperbarui realtime'
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <div className="absolute inset-0 grid-bg pointer-events-none" style={{ opacity: 0.04 }} />
      <div className="relative max-w-[1400px] mx-auto px-6 pt-9 pb-7">
        <div className="flex items-start justify-between gap-8 flex-wrap">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
              <Icon name="Sparkles" size={13} /> Dataset aktif · {ds.short}
            </div>
            <h1 className="text-[44px] sm:text-[52px] leading-[1.05] font-extrabold tracking-tight text-primary">
              {titles[dataset]}
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted max-w-xl">{sources[dataset]}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="indigo"><Icon name={ds.icon} size={11} className="mr-1"/> {ds.short}</Badge>
              <Badge tone="green"><PulseDot size={6} className="mr-1" /> LIVE API</Badge>
              <Badge>OPEN DATA</Badge>
              <Badge>JSON · REST</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {viewData.stats.map((s, i) => (
              <StatCallout key={i} {...s} loading={viewData.loading} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * FilterBar
 * ─────────────────────────────────────────────────────────────────────── */
function FilterBar({ dataset, filters, setFilters, onExport, viewData, searchRef }) {
  const placeholder = {
    bmkg:  'Cari wilayah, magnitude, kedalaman…',
    wb:    'Cari indikator atau tahun…',
    covid: 'Cari provinsi, tanggal…'
  }[dataset];

  const groups = {
    bmkg: [
      { key: 'region',   label: 'Wilayah',    options: ['Semua', 'Sumatera', 'Jawa', 'Bali & Nusa', 'Sulawesi', 'Maluku', 'Papua'] },
      { key: 'category', label: 'Kategori',   options: ['Semua', 'Dangkal (<60km)', 'Menengah (60–300km)', 'Dalam (>300km)'] }
    ],
    wb: [
      { key: 'indicator', label: 'Indikator', options: ['GDP', 'GDP per Kapita', 'Inflasi', 'Populasi', 'Pengangguran'] },
      { key: 'decade',    label: 'Dekade',    options: ['Semua', '1960-an', '1970-an', '1980-an', '1990-an', '2000-an', '2010-an', '2020-an'] }
    ],
    covid: [
      { key: 'province', label: 'Provinsi',  options: ['Semua', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatera Utara'] },
      { key: 'phase',    label: 'Fase',      options: ['Semua', 'Gelombang 1 (2020)', 'Delta (2021)', 'Omicron (2022)', 'Endemi (2023+)'] }
    ]
  }[dataset];

  const activeChips = Object.entries(filters)
    .filter(([k, v]) => v && v !== 'Semua' && k !== 'q' && k !== 'range')
    .map(([k, v]) => ({ key: k, value: v }));

  if (filters.q) activeChips.unshift({ key: 'Pencarian', value: filters.q });
  if (filters.range) activeChips.push({ key: 'Periode', value: filters.range });

  return (
    <div className="sticky top-16 z-30 bg-bg/85 backdrop-blur border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              ref={searchRef}
              value={filters.q || ''}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholder={placeholder}
              className="w-full h-9 pl-9 pr-12 rounded-lg border border-border bg-white text-[13px] placeholder:text-ink-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2">/</kbd>
          </div>

          <button className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-border bg-white text-[13px] hover:bg-bg">
            <Icon name="Calendar" size={14} className="text-ink-muted" />
            <span className="font-mono text-[12px]">{filters.range || 'Semua periode'}</span>
            <Icon name="ChevronDown" size={13} className="text-ink-muted" />
          </button>

          {groups.map(g => (
            <Dropdown key={g.key}
              trigger={
                <button className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg border border-border bg-white text-[13px] hover:bg-bg">
                  <span className="text-ink-muted">{g.label}:</span>
                  <span className="font-medium">{filters[g.key] || g.options[0]}</span>
                  <Icon name="ChevronDown" size={13} className="text-ink-muted" />
                </button>
              }>
              {g.options.map(o => (
                <MenuItem key={o} active={(filters[g.key] || g.options[0]) === o} onClick={() => setFilters({ ...filters, [g.key]: o })}>{o}</MenuItem>
              ))}
            </Dropdown>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon="RotateCcw" onClick={() => setFilters({})}>Reset</Button>
            <Button size="sm" icon="Download" iconRight="ChevronDown" onClick={onExport}>Export</Button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">Filter aktif</span>
            {activeChips.map(c => (
              <FilterChip key={c.key} label={c.key} value={c.value}
                onRemove={() => {
                  const next = { ...filters };
                  if (c.key === 'Pencarian') next.q = '';
                  else if (c.key === 'Periode') next.range = '';
                  else next[c.key] = '';
                  setFilters(next);
                }} />
            ))}
            <span className="text-[11px] text-ink-muted ml-1">
              · <span className="font-mono">{viewData.rowCount}</span> baris ditampilkan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * FeaturedChart
 * ─────────────────────────────────────────────────────────────────────── */
function ChartTypeToggle({ value, onChange, allowed = ['line', 'bar', 'area'] }) {
  const items = [
    { id: 'line', icon: 'LineChart' },
    { id: 'bar',  icon: 'BarChart3' },
    { id: 'area', icon: 'AreaChart' }
  ].filter(i => allowed.includes(i.id));
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-white">
      {items.map(i => (
        <button key={i.id} onClick={() => onChange(i.id)}
          className={cn('w-7 h-7 inline-flex items-center justify-center rounded-md',
                        value === i.id ? 'bg-primary text-white' : 'text-ink-muted hover:text-ink hover:bg-bg')}>
          <Icon name={i.icon} size={14} />
        </button>
      ))}
    </div>
  );
}

function FeaturedChart({ viewData, dataset, indicator, setIndicator }) {
  const [chartType, setChartType] = React.useState(viewData.featured.defaultType || 'line');
  const [hidden, setHidden] = React.useState({});
  const series = viewData.featured.series.filter(s => !hidden[s.key]);

  const renderChart = () => {
    const data = viewData.featured.data;
    if (!data || data.length === 0) return <EmptyState message="Belum ada data untuk visualisasi ini." />;

    const common = {
      data,
      margin: { top: 8, right: 18, left: 4, bottom: 6 }
    };
    const axes = (
      <>
        <CartesianGrid stroke="#EFEFE9" vertical={false} />
        <XAxis dataKey={viewData.featured.xKey} tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'JetBrains Mono' }}
               tickFormatter={viewData.featured.yFormat || (v => v)}
               axisLine={false} tickLine={false} width={56} />
        <RcTooltip
          formatter={(v, n) => [viewData.featured.yFormat ? viewData.featured.yFormat(v) : v, n]}
          cursor={{ stroke: '#1E2761', strokeOpacity: 0.1 }} />
        {viewData.featured.reference && (
          <ReferenceLine
            y={viewData.featured.reference.y}
            stroke={PALETTE.accent} strokeDasharray="4 3"
            label={{ value: viewData.featured.reference.label, fill: '#7c5310', fontSize: 11, position: 'insideTopRight' }} />
        )}
      </>
    );

    if (chartType === 'bar') {
      return (
        <BarChart {...common}>
          {axes}
          {series.map(s => <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} />)}
        </BarChart>
      );
    }
    if (chartType === 'area') {
      return (
        <AreaChart {...common}>
          <defs>
            {series.map(s => (
              <linearGradient key={s.key} id={'g-' + s.key} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          {axes}
          {series.map(s => (
            <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color}
                  strokeWidth={2} fill={`url(#g-${s.key})`}
                  stackId={viewData.featured.stack ? '1' : undefined} />
          ))}
        </AreaChart>
      );
    }
    return (
      <LineChart {...common}>
        {axes}
        {series.map(s => (
          <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color}
                strokeWidth={2.2}
                dot={{ r: 2.5, stroke: s.color, fill: '#fff' }}
                activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-semibold tracking-tight">{viewData.featured.title}</h3>
            <Tooltip content={viewData.featured.endpoint}>
              <Icon name="Info" size={14} className="text-ink-muted cursor-help" />
            </Tooltip>
            <Badge tone="indigo">{viewData.featured.sourceLabel}</Badge>
          </div>
          <p className="text-[12px] text-ink-muted mt-1">{viewData.featured.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {dataset === 'wb' && (
            <Dropdown
              trigger={
                <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-white text-[12px]">
                  <Icon name="LineChart" size={13} className="text-ink-muted" />
                  <span className="font-medium">{indicator}</span>
                  <Icon name="ChevronDown" size={12} className="text-ink-muted" />
                </button>
              }>
              {['GDP', 'GDP per Kapita', 'Inflasi', 'Populasi', 'Pengangguran'].map(x => (
                <MenuItem key={x} active={x === indicator} onClick={() => setIndicator(x)}>{x}</MenuItem>
              ))}
            </Dropdown>
          )}
          <ChartTypeToggle value={chartType} onChange={setChartType} allowed={viewData.featured.allowed || ['line', 'bar', 'area']} />
          <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-border bg-white text-ink-muted hover:text-ink"><Icon name="Maximize2" size={14}/></button>
        </div>
      </div>

      <div className="px-2 pb-3" style={{ height: 360 }}>
        {viewData.loading ? (
          <div className="px-4 h-full flex flex-col gap-3 justify-end">
            <div className="h-full w-full shimmer rounded-lg" />
          </div>
        ) : viewData.error ? (
          <ErrorState onRetry={viewData.refetch} message={viewData.errorMessage} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
        )}
      </div>

      <div className="px-6 pb-5 pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border">
        {viewData.featured.series.map(s => (
          <button key={s.key} onClick={() => setHidden(h => ({ ...h, [s.key]: !h[s.key] }))}
            className={cn('inline-flex items-center gap-2 text-[12px] py-1 transition-opacity',
                          hidden[s.key] && 'opacity-40 line-through')}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-ink-muted">{s.label}</span>
          </button>
        ))}
        <div className="ml-auto text-[11px] text-ink-muted font-mono">{viewData.featured.footer}</div>
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * DistributionChart (donut)
 * ─────────────────────────────────────────────────────────────────────── */
function DistributionChart({ viewData }) {
  const d = viewData.distribution;
  const total = d.data.reduce((a, b) => a + b.value, 0);
  return (
    <Card className="p-6 h-full flex flex-col" interactive>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{d.title}</h3>
            <Tooltip content={d.hint}><Icon name="Info" size={13} className="text-ink-muted cursor-help" /></Tooltip>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">{d.subtitle}</p>
        </div>
        <Badge>{d.badge}</Badge>
      </div>
      <div className="flex-1 grid grid-cols-5 gap-3 items-center mt-2 min-h-[200px]">
        <div className="col-span-2 relative" style={{ height: 200 }}>
          {viewData.loading ? <div className="w-full h-full shimmer rounded-full" /> : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={d.data} dataKey="value" innerRadius={60} outerRadius={84} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                  {d.data.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <RcTooltip formatter={(v) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted">Total</div>
            <div className="font-mono text-[17px] font-semibold text-ink">{viewData.loading ? '—' : formatNumber(total, { compact: true })}</div>
          </div>
        </div>
        <div className="col-span-3 space-y-2">
          {d.data.map((s, i) => {
            const pct = total ? (s.value / total) * 100 : 0;
            return (
              <div key={i} className="text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="text-ink">{s.label}</span>
                  </span>
                  <span className="font-mono text-ink-muted">{pct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 bg-[#F3F3EE] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: pct + '%', background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * RankingChart (horizontal bar)
 * ─────────────────────────────────────────────────────────────────────── */
function RankingChart({ viewData }) {
  const r = viewData.ranking;
  const max = Math.max(...r.data.map(d => d.value), 1);
  return (
    <Card className="p-6 h-full flex flex-col" interactive>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{r.title}</h3>
            <Tooltip content={r.hint}><Icon name="Info" size={13} className="text-ink-muted cursor-help" /></Tooltip>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">{r.subtitle}</p>
        </div>
        <Badge tone="amber">Top 5</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {viewData.loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 shimmer rounded-md" />)
          : r.data.map((d, i) => (
              <div key={i} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 text-[12px]">
                <span className="font-mono text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-ink truncate">{d.label}</div>
                  <div className="mt-1 h-2 rounded-full bg-[#F3F3EE] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: (d.value / max * 100) + '%', background: PALETTE.primary }} />
                  </div>
                </div>
                <span className="font-mono text-ink">{r.format ? r.format(d.value) : formatNumber(d.value)}</span>
              </div>
            ))}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * InsightsCard
 * ─────────────────────────────────────────────────────────────────────── */
function InsightsCard({ viewData }) {
  const items = viewData.insights;
  return (
    <Card className="p-6 h-full flex flex-col" interactive>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">Insight Otomatis</h3>
            <Tooltip content="Disusun otomatis dari data terkini."><Icon name="Info" size={13} className="text-ink-muted cursor-help" /></Tooltip>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">Disusun dari data {viewData.featured.sourceLabel}</p>
        </div>
        <Badge tone="green"><PulseDot size={5} className="mr-1" /> AUTO</Badge>
      </div>
      <div className="mt-4 space-y-3 flex-1">
        {viewData.loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 shimmer rounded-md" />)
          : items.map((it, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-[#FBFBF7]">
                <div className={cn('w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0',
                                   it.tone === 'amber' ? 'bg-accent-50 text-[#7c5310]' :
                                   it.tone === 'red'   ? 'bg-red-50 text-red-700' :
                                   it.tone === 'green' ? 'bg-emerald-50 text-emerald-700' :
                                                         'bg-primary-50 text-primary')}>
                  <Icon name={it.icon} size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">{it.eyebrow}</div>
                  <div className="text-[13px] text-ink mt-0.5">{it.body}</div>
                </div>
              </div>
            ))}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * DataTable — sortable, paginated, in-table search, columns visibility
 * ─────────────────────────────────────────────────────────────────────── */
function DataTable({ viewData, onView, onCopy }) {
  const cols = viewData.table.columns;
  const [sort, setSort] = React.useState({ key: cols[0].key, dir: 'asc' });
  const [tableQ, setTableQ] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [hiddenCols, setHiddenCols] = React.useState({});
  const PAGE = 10;

  const filtered = React.useMemo(() => {
    const q = tableQ.trim().toLowerCase();
    if (!q) return viewData.table.rows;
    return viewData.table.rows.filter(r =>
      cols.some(c => String(c.accessor ? c.accessor(r) : r[c.key]).toLowerCase().includes(q))
    );
  }, [tableQ, viewData.table.rows, cols]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const col = cols.find(c => c.key === sort.key);
      const av = col?.accessor ? col.accessor(a) : a[sort.key];
      const bv = col?.accessor ? col.accessor(b) : b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sort, cols]);

  const total = sorted.length;
  const start = page * PAGE;
  const pageRows = sorted.slice(start, start + PAGE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-3 flex-wrap border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{viewData.table.title}</h3>
            <Badge tone="indigo">{formatNumber(total)} baris</Badge>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">Klik kolom untuk mengurutkan. Pencarian berlaku di seluruh kolom.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input value={tableQ} onChange={e => { setTableQ(e.target.value); setPage(0); }}
              placeholder="Cari di tabel…"
              className="h-8 w-52 pl-8 pr-2 rounded-md border border-border bg-white text-[12px] focus:outline-none focus:border-primary/50" />
          </div>
          <Dropdown
            trigger={
              <button className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md border border-border bg-white text-[12px]">
                <Icon name="Columns3" size={13} className="text-ink-muted" /> Kolom
                <Icon name="ChevronDown" size={12} className="text-ink-muted" />
              </button>}>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Tampilkan</div>
            {cols.map(c => (
              <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-bg cursor-pointer">
                <input type="checkbox" checked={!hiddenCols[c.key]} onChange={e => setHiddenCols(h => ({ ...h, [c.key]: !e.target.checked }))} className="accent-primary"/>
                {c.label}
              </label>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#F5F5F0] border-b border-border">
              {cols.filter(c => !hiddenCols[c.key]).map(c => (
                <th key={c.key} className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider text-ink-muted font-semibold cursor-pointer select-none"
                    onClick={() => setSort(s => ({ key: c.key, dir: s.key === c.key && s.dir === 'asc' ? 'desc' : 'asc' }))}>
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sort.key === c.key
                      ? <Icon name={sort.dir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} className="text-primary"/>
                      : <Icon name="ChevronsUpDown" size={12} className="text-ink-muted opacity-50" />}
                  </span>
                </th>
              ))}
              <th className="w-20 px-4 py-2.5 text-right text-[11px] uppercase tracking-wider text-ink-muted font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {viewData.loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {cols.filter(c => !hiddenCols[c.key]).map(c => <td key={c.key} className="px-4 py-3"><div className="h-3 w-24 shimmer rounded" /></td>)}
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : pageRows.length === 0
                ? <tr><td colSpan={cols.length + 1}><EmptyState message="Tidak ada baris yang cocok." /></td></tr>
                : pageRows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-[#FBFBF7] transition-colors">
                    {cols.filter(c => !hiddenCols[c.key]).map(c => (
                      <td key={c.key} className={cn('px-4 py-3 align-middle', c.mono && 'font-mono')}>
                        {c.render ? c.render(row) : (c.accessor ? c.accessor(row) : row[c.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <button onClick={() => onView(row)} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-primary hover:bg-bg" aria-label="Lihat detail">
                          <Icon name="Eye" size={14} />
                        </button>
                        <button onClick={() => onCopy(row)} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-primary hover:bg-bg" aria-label="Salin JSON">
                          <Icon name="Copy" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 flex items-center justify-between border-t border-border text-[12px]">
        <div className="text-ink-muted font-mono">
          Menampilkan {total === 0 ? 0 : start + 1}–{Math.min(start + PAGE, total)} dari {formatNumber(total)}
        </div>
        <div className="inline-flex items-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border bg-white disabled:opacity-40 hover:bg-bg">
            <Icon name="ChevronLeft" size={14} />
          </button>
          <span className="px-2 font-mono">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border bg-white disabled:opacity-40 hover:bg-bg">
            <Icon name="ChevronRight" size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Empty / Error states
 * ─────────────────────────────────────────────────────────────────────── */
function EmptyState({ message = 'Tidak ada data.', icon = 'Inbox' }) {
  return (
    <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-ink-muted p-8">
      <div className="w-10 h-10 rounded-full bg-bg border border-border inline-flex items-center justify-center mb-2">
        <Icon name={icon} size={18} />
      </div>
      <div className="text-[13px]">{message}</div>
    </div>
  );
}

function ErrorState({ onRetry, message = 'Gagal memuat data dari sumber.' }) {
  return (
    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 inline-flex items-center justify-center text-red-600 mb-2">
        <Icon name="AlertTriangle" size={18} />
      </div>
      <div className="text-[14px] font-medium text-ink">{message}</div>
      <p className="text-[12px] text-ink-muted mt-1 max-w-sm">Endpoint mungkin sedang offline atau memblokir permintaan CORS. Coba lagi atau periksa konsol.</p>
      <div className="mt-3"><Button size="sm" variant="outline" icon="RefreshCw" onClick={onRetry}>Coba lagi</Button></div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * ExportModal — real CSV + PDF export via papaparse + jsPDF/html2canvas
 * ─────────────────────────────────────────────────────────────────────── */
function ExportModal({ open, onClose, viewData, dataset, dashboardRef }) {
  const [fmt, setFmt] = React.useState('csv');
  const [opts, setOpts] = React.useState({ includeChart: true, includeFilters: true, includeMeta: true });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function doExport() {
    setBusy(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fname = `datakita_${dataset}_${viewData.table.exportSlug || 'data'}_${stamp}`;

      if (fmt === 'csv') {
        const rows = viewData.table.rows.map(r => {
          const o = {};
          viewData.table.columns.forEach(c => { o[c.label] = c.accessor ? c.accessor(r) : r[c.key]; });
          return o;
        });
        const csv = window.Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname + '.csv';
        a.click();
      } else {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
        doc.text('DataKita', 40, 60);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(100);
        doc.text('Dashboard Data Publik Indonesia · Politeknik Elektronika Negeri Surabaya', 40, 78);
        doc.setFontSize(14); doc.setTextColor(30, 39, 97);
        doc.text(viewData.featured.title, 40, 120);
        doc.setFontSize(10); doc.setTextColor(80);
        doc.text('Sumber: ' + viewData.featured.endpoint, 40, 138);
        doc.text('Dibuat: ' + new Date().toLocaleString('id-ID'), 40, 154);

        if (opts.includeChart && dashboardRef.current) {
          try {
            const canvas = await window.html2canvas(dashboardRef.current, { scale: 1.5, backgroundColor: '#FAFAF7' });
            const img = canvas.toDataURL('image/png');
            doc.addPage();
            const w = doc.internal.pageSize.getWidth() - 80;
            const h = (canvas.height / canvas.width) * w;
            doc.addImage(img, 'PNG', 40, 40, w, h);
          } catch (e) { console.warn('snapshot failed', e); }
        }

        doc.addPage();
        doc.setFontSize(13); doc.setTextColor(0);
        doc.text('Ringkasan Tabel', 40, 50);
        doc.setFontSize(9); doc.setTextColor(80);
        let y = 76;
        const sample = viewData.table.rows.slice(0, 25);
        sample.forEach((r, idx) => {
          const line = viewData.table.columns.slice(0, 4).map(c => (c.accessor ? c.accessor(r) : r[c.key])).join('  ·  ');
          doc.text(String(idx + 1).padStart(2, '0') + '   ' + String(line).slice(0, 110), 40, y);
          y += 14;
          if (y > 800) { doc.addPage(); y = 50; }
        });

        doc.save(fname + '.pdf');
      }
    } catch (e) {
      console.error('Export failed', e);
      alert('Export gagal: ' + e.message);
    }
    setBusy(false);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ animation: 'overlayIn 120ms ease-out both' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white rounded-2xl border border-border shadow-2xl overflow-hidden"
           style={{ animation: 'modalIn 160ms cubic-bezier(.2,.8,.2,1) both' }}>
        <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-border">
          <div>
            <h3 className="text-[17px] font-semibold tracking-tight">Export Data</h3>
            <p className="text-[12px] text-ink-muted mt-0.5">Pilih format dan rentang data yang ingin diunduh</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-bg">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'csv', icon: 'FileSpreadsheet', label: 'CSV', hint: 'Data tabular terbuka (Excel, Sheets)' },
              { id: 'pdf', icon: 'FileText',        label: 'PDF', hint: 'Laporan dengan grafik + tabel' }
            ].map(f => (
              <button key={f.id} onClick={() => setFmt(f.id)}
                className={cn('text-left p-4 rounded-xl border-2 transition-colors',
                              fmt === f.id ? 'border-accent bg-accent-50' : 'border-border bg-white hover:bg-bg')}>
                <Icon name={f.icon} size={20} className={fmt === f.id ? 'text-[#7c5310]' : 'text-ink-muted'} />
                <div className="mt-2 text-[14px] font-semibold">{f.label}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">{f.hint}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2.5">
            <label className={cn('flex items-center gap-2.5 text-[13px]', fmt !== 'pdf' && 'opacity-50')}>
              <input type="checkbox" disabled={fmt !== 'pdf'} checked={opts.includeChart} onChange={e => setOpts({ ...opts, includeChart: e.target.checked })} className="accent-accent w-4 h-4" />
              Sertakan grafik (PDF only)
            </label>
            <label className="flex items-center gap-2.5 text-[13px]">
              <input type="checkbox" checked={opts.includeFilters} onChange={e => setOpts({ ...opts, includeFilters: e.target.checked })} className="accent-accent w-4 h-4" />
              Sertakan filter aktif
            </label>
            <label className="flex items-center gap-2.5 text-[13px]">
              <input type="checkbox" checked={opts.includeMeta} onChange={e => setOpts({ ...opts, includeMeta: e.target.checked })} className="accent-accent w-4 h-4" />
              Sertakan metadata sumber
            </label>
          </div>
        </div>

        <div className="px-6 py-4 bg-bg border-t border-border flex items-center justify-between">
          <div className="text-[11px] text-ink-muted">
            <kbd>Esc</kbd> untuk tutup · <kbd>↵</kbd> unduh
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Batal</Button>
            <Button onClick={doExport} icon={busy ? 'Loader2' : 'Download'} disabled={busy}>
              {busy ? 'Memproses…' : 'Unduh Sekarang'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Disclosure "Tentang dataset ini"
 * ─────────────────────────────────────────────────────────────────────── */
function DatasetDisclosure({ dataset }) {
  const [open, setOpen] = React.useState(false);
  const copy = {
    bmkg: {
      what: 'Data gempa bumi dirilis publik oleh Badan Meteorologi, Klimatologi, dan Geofisika (BMKG).',
      method: 'Endpoint TEWS (Tsunami Early Warning System) menyediakan event signifikan (M≥5.0), event terkini, serta gempa yang dirasakan oleh pengamat manusia. Frekuensi pembaruan: realtime.',
      endpoint: 'https://data.bmkg.go.id/DataMKG/TEWS/'
    },
    wb: {
      what: 'World Bank Open Data — indikator makroekonomi resmi untuk negara Indonesia (kode ISO: IDN).',
      method: 'Tiap indikator (NY.GDP.MKTP.CD, FP.CPI.TOTL.ZG, dst) mengembalikan series tahunan dari 1960. Visualisasi mengabaikan tahun dengan nilai null.',
      endpoint: 'https://api.worldbank.org/v2/country/IDN/indicator/'
    },
    covid: {
      what: 'Time-series historis pandemi COVID-19 Indonesia dari disease.sh — agregator data Johns Hopkins University, Worldometers, dan sumber resmi nasional.',
      method: '/historical/Indonesia mengembalikan timeline kumulatif sejak 22 Januari 2020. Daily new dihitung dengan diff dua titik kumulatif yang berurutan. Ranking ASEAN diambil dari /countries dan dinormalisasi per juta penduduk.',
      endpoint: 'https://disease.sh/v3/covid-19/'
    }
  }[dataset];

  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-bg/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary-50 text-primary inline-flex items-center justify-center"><Icon name="BookOpen" size={15} /></div>
          <div>
            <div className="text-[14px] font-semibold">Tentang dataset ini</div>
            <div className="text-[11px] text-ink-muted">Metodologi, frekuensi pembaruan, dan tautan endpoint</div>
          </div>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-ink-muted" />
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 grid md:grid-cols-3 gap-6 text-[13px] text-ink">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">Apa ini?</div>
            <p>{copy.what}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">Metodologi</div>
            <p>{copy.method}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">Endpoint resmi</div>
            <code className="text-[12px] text-primary break-all">{copy.endpoint}</code>
          </div>
        </div>
      )}
    </Card>
  );
}

Object.assign(window, {
  HeroHeader, FilterBar, FeaturedChart, DistributionChart,
  RankingChart, InsightsCard, DataTable, ExportModal,
  EmptyState, ErrorState, DatasetDisclosure, PALETTE
});
