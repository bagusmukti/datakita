/* eslint-disable */
/**
 * DataKita — UI primitives + layout
 *
 * Mirrors src/components/ui/* and src/components/layout/*.
 * Icons: thin React wrapper over lucide's vanilla icon dataset.
 */

/* ──────────────────────────────────────────────────────────────────────────
 * Icon — Lucide
 *   lucide.icons.<PascalName> is shaped ['svg', svgAttrs, [ [tag, attrs], … ]].
 *   We render our own <svg> wrapper and inject the inner children only.
 * ─────────────────────────────────────────────────────────────────────── */
function Icon({ name, size = 16, className = '', strokeWidth = 1.75, style }) {
  const dict = (window.lucide && window.lucide.icons) || {};
  const node = dict[name];
  let children = null;
  if (Array.isArray(node)) {
    // ['svg', attrs, [...children]]  OR  flat array of child tuples
    if (typeof node[0] === 'string' && Array.isArray(node[2])) children = node[2];
    else if (Array.isArray(node[0])) children = node;
  }
  if (!children) {
    return <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round"
         className={className} style={style} aria-hidden="true">
      {children.map((c, i) => {
        if (!Array.isArray(c)) return null;
        const [tag, attrs] = c;
        return React.createElement(tag, { key: i, ...(attrs || {}) });
      })}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Button / Badge / Card / etc.
 * ─────────────────────────────────────────────────────────────────────── */
function Button({ as: Tag = 'button', variant = 'primary', size = 'md', className = '', icon, iconRight, children, ...rest }) {
  const v = {
    primary:  'bg-accent text-[#1a1306] hover:bg-[#e89713] active:bg-[#d68b10] shadow-card',
    primaryInk: 'bg-primary text-white hover:bg-primary-700',
    ghost:    'bg-transparent text-ink hover:bg-black/5',
    outline:  'bg-white border border-border text-ink hover:bg-bg',
    danger:   'bg-danger text-white hover:bg-red-700'
  }[variant];
  const s = { sm: 'h-8 px-3 text-[13px]', md: 'h-9 px-3.5 text-[13px]', lg: 'h-11 px-5 text-sm' }[size];
  return (
    <Tag {...rest} className={cn('inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50', v, s, className)}>
      {icon && <Icon name={icon} size={15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={15} />}
    </Tag>
  );
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const t = {
    neutral: 'bg-[#F3F3EE] text-ink-muted border-border',
    indigo:  'bg-primary-50 text-primary border-primary-100',
    amber:   'bg-accent-50 text-[#7c5310] border-accent-100',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-100',
    red:     'bg-red-50 text-red-700 border-red-100',
    blue:    'bg-sky-50 text-sky-700 border-sky-100'
  }[tone];
  return <span className={cn('inline-flex items-center gap-1 h-[22px] px-2 rounded-md border text-[11px] font-medium font-mono uppercase tracking-wide', t, className)}>{children}</span>;
}

function Card({ children, className = '', as: Tag = 'div', interactive = false }) {
  return (
    <Tag className={cn(
      'bg-surface border border-border rounded-xl',
      interactive && 'transition-shadow hover:shadow-lift',
      className
    )}>
      {children}
    </Tag>
  );
}

function PulseDot({ tone = 'green', size = 8, className = '' }) {
  const col = { green: '#16A34A', amber: '#F5A623', red: '#DC2626', blue: '#1E2761', gray: '#9CA3AF' }[tone] || '#16A34A';
  return (
    <span className={cn('inline-block rounded-full pulse-dot', className)}
      style={{ width: size, height: size, background: col, boxShadow: `0 0 0 0 ${col}55` }} />
  );
}

function StatCallout({ eyebrow, value, unit, hint, tone = 'indigo', loading }) {
  const toneBg = { indigo: 'bg-primary-50 text-primary', amber: 'bg-accent-50 text-[#7c5310]', green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700' }[tone];
  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3 min-w-[160px]">
      <div className={cn('inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider', toneBg)}>
        <PulseDot tone={tone === 'amber' ? 'amber' : tone === 'red' ? 'red' : 'green'} size={6} />
        {eyebrow}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        {loading
          ? <div className="h-7 w-24 rounded shimmer" />
          : <span className="font-mono font-semibold text-ink text-[22px] tracking-tight">{value}</span>}
        {unit && !loading && <span className="text-[11px] text-ink-muted font-mono">{unit}</span>}
      </div>
      {hint && <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function FilterChip({ label, value, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1 rounded-full bg-primary-50 border border-primary-100 text-primary text-[12px]">
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
      <button onClick={onRemove} className="ml-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-primary-100" aria-label="Hapus filter">
        <Icon name="X" size={11} />
      </button>
    </span>
  );
}

function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[220px] bg-white border border-border rounded-xl shadow-lift py-1.5',
            'origin-top transition transform',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          style={{ animation: 'dropFade 120ms ease-out both' }}
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, children, active, onClick, kbd }) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left hover:bg-bg',
                    active && 'text-primary font-medium')}>
      {icon && <Icon name={icon} size={15} className={active ? 'text-primary' : 'text-ink-muted'} />}
      <span className="flex-1">{children}</span>
      {active && <Icon name="Check" size={14} className="text-primary" />}
      {kbd && <kbd>{kbd}</kbd>}
    </button>
  );
}

function SkeletonLoader({ className = 'h-4 w-full', count = 1 }) {
  return <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn('rounded-md shimmer', className)} />
    ))}
  </>;
}

function Tooltip({ content, children, side = 'top' }) {
  const [show, setShow] = React.useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className={cn(
          'absolute z-50 px-2 py-1 rounded-md bg-ink text-white text-[11px] whitespace-nowrap pointer-events-none',
          side === 'top' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
          side === 'right' && 'left-full ml-2 top-1/2 -translate-y-1/2'
        )}>{content}</span>
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Layout — Navbar / Footer
 * ─────────────────────────────────────────────────────────────────────── */
function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#1E2761" />
      <rect x="7"  y="17" width="3.5" height="9"  rx="1.2" fill="#F5A623" />
      <rect x="12.5" y="12" width="3.5" height="14" rx="1.2" fill="#A8C5E0" />
      <rect x="18"  y="8"  width="3.5" height="18" rx="1.2" fill="#FFFFFF" />
      <rect x="23.5" y="14" width="3.5" height="12" rx="1.2" fill="#F5A623" />
    </svg>
  );
}

const DATASETS = [
  { id: 'bmkg',  label: 'BMKG · Cuaca & Gempa',          short: 'BMKG',       icon: 'CloudSun',    source: 'data.bmkg.go.id',   tone: 'indigo' },
  { id: 'wb',    label: 'World Bank · Ekonomi',           short: 'World Bank', icon: 'TrendingUp',  source: 'api.worldbank.org', tone: 'green'  },
  { id: 'covid', label: 'disease.sh · COVID-19 Indonesia', short: 'COVID-19',   icon: 'Activity',    source: 'disease.sh',         tone: 'red'    }
];

function Navbar({ route, setRoute, dataset, setDataset, apiStatus }) {
  const ds = DATASETS.find(d => d.id === dataset);
  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'datasets',  label: 'Datasets'  },
    { id: 'about',     label: 'Tentang'   },
    { id: 'api-docs',  label: 'API Docs'  }
  ];
  return (
    <header className="sticky top-0 z-40 h-16 bg-bg/85 backdrop-blur border-b border-border">
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center gap-8">
        <a href="#dashboard" onClick={(e) => { e.preventDefault(); setRoute('dashboard'); }} className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-[17px] font-bold tracking-tight text-primary">DataKita</span>
          <Badge tone="amber" className="ml-1 hidden sm:inline-flex">v0.9 · BETA</Badge>
        </a>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map(l => {
            const active = route === l.id;
            return (
              <a key={l.id} href={'#' + l.id}
                 onClick={(e) => { e.preventDefault(); setRoute(l.id); }}
                 className={cn('relative px-3 py-2 text-[13px] font-medium transition-colors',
                              active ? 'text-primary' : 'text-ink-muted hover:text-ink')}>
                {l.label}
                {active && <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-accent rounded-full" />}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Dropdown
            trigger={
              <button className="h-9 inline-flex items-center gap-2 pl-2.5 pr-2 rounded-lg border border-border bg-white hover:bg-bg text-[13px]">
                <Icon name={ds.icon} size={15} className="text-primary" />
                <span className="font-medium text-ink">{ds.short}</span>
                <Icon name="ChevronDown" size={14} className="text-ink-muted" />
              </button>
            }>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Pilih Dataset</div>
            {DATASETS.map(d => (
              <MenuItem key={d.id} icon={d.icon} active={d.id === dataset} onClick={() => setDataset(d.id)}>
                <div className="leading-tight">
                  <div>{d.label}</div>
                  <div className="text-[11px] text-ink-muted font-mono">{d.source}</div>
                </div>
              </MenuItem>
            ))}
          </Dropdown>

          <div className="hidden lg:flex items-center gap-1 h-9 px-2 rounded-lg border border-border bg-white text-[12px] text-ink-muted">
            <button className="px-1.5 rounded text-primary font-semibold">ID</button>
            <span className="text-border">·</span>
            <button className="px-1.5 rounded hover:text-ink">EN</button>
          </div>

          <div className={cn(
            'hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-full text-[12px] font-medium border',
            apiStatus === 'ok' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' :
            apiStatus === 'pending' ? 'border-amber-100 bg-amber-50 text-amber-700' :
            'border-red-100 bg-red-50 text-red-700'
          )}>
            <PulseDot tone={apiStatus === 'ok' ? 'green' : apiStatus === 'pending' ? 'amber' : 'red'} />
            {apiStatus === 'ok' ? 'Terhubung' : apiStatus === 'pending' ? 'Memuat' : 'Gangguan'}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative mt-12 border-t border-border bg-white overflow-hidden">
      <div className="absolute inset-0 batik-bg pointer-events-none" style={{ opacity: 0.05 }} />
      <div className="relative max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between text-[12px]">
        <div className="text-ink-muted">
          <span className="font-semibold text-ink">DataKita</span> · Politeknik Elektronika Negeri Surabaya · 2026
        </div>
        <div className="hidden md:flex items-center gap-3 text-ink-muted">
          <span>Powered by</span>
          <span className="inline-flex items-center gap-1"><Icon name="CloudSun" size={13} className="text-primary"/> BMKG</span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1"><Icon name="TrendingUp" size={13} className="text-emerald-600"/> World Bank</span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1"><Icon name="Activity" size={13} className="text-red-600"/> disease.sh</span>
        </div>
        <a href="#" className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink">
          <Icon name="Github" size={15} /><span className="hidden sm:inline">github.com/pens/datakita</span>
        </a>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Icon, Button, Badge, Card, PulseDot, StatCallout, FilterChip, Dropdown, MenuItem,
  SkeletonLoader, Tooltip, Logo, Navbar, Footer, DATASETS
});
