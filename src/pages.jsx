/* eslint-disable */
/**
 * DataKita — secondary pages
 * Datasets / About / ApiDocs
 */

function DatasetsPage({ setRoute, setDataset, status }) {
  const cards = [
    {
      id: 'bmkg',
      title: 'BMKG · Cuaca & Gempa',
      icon: 'CloudSun',
      tone: 'indigo',
      body: 'Event seismik realtime, gempa M≥5.0, gempa dirasakan, dan prakiraan cuaca per provinsi langsung dari Badan Meteorologi, Klimatologi, dan Geofisika.',
      meta: [
        ['Pembaruan',   status.bmkg.updated],
        ['Cakupan',     'Indonesia · seluruh wilayah'],
        ['Format',      'JSON · REST']
      ],
      tags: ['Realtime', 'Seismik', 'Cuaca', 'BMKG']
    },
    {
      id: 'wb',
      title: 'World Bank · Indikator Ekonomi',
      icon: 'TrendingUp',
      tone: 'green',
      body: 'PDB, PDB per kapita, inflasi tahunan, populasi, dan tingkat pengangguran Indonesia dari World Bank Open Data, runtut sejak 1960.',
      meta: [
        ['Pembaruan',   status.wb.updated],
        ['Periode',     '1960 – sekarang'],
        ['Format',      'JSON · REST · paginated']
      ],
      tags: ['Tahunan', 'Makro', 'World Bank']
    },
    {
      id: 'covid',
      title: 'disease.sh · COVID-19 Indonesia',
      icon: 'Activity',
      tone: 'red',
      body: 'Time-series historis pandemi Indonesia plus perbandingan ASEAN dari disease.sh — agregator data terbuka berbasis JHU, Worldometers, dan sumber nasional. CORS-aware tanpa API key.',
      meta: [
        ['Pembaruan',   status.covid.updated],
        ['Cakupan',     'Indonesia + 6 negara ASEAN'],
        ['Format',      'JSON · REST']
      ],
      tags: ['Realtime', 'Kesehatan', 'ASEAN', 'disease.sh']
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
          <Icon name="Database" size={13} /> Katalog Dataset
        </div>
        <h1 className="text-[40px] leading-tight font-extrabold tracking-tight text-primary">Tiga sumber data publik. Satu jendela.</h1>
        <p className="mt-3 text-ink-muted text-[15px]">
          Setiap dataset diambil langsung dari endpoint resmi melalui lapisan abstraksi React Query, dengan fallback CORS otomatis untuk menjamin ketersediaan dari browser.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {cards.map(c => (
          <Card key={c.id} className="p-6 flex flex-col" interactive>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-11 h-11 rounded-xl inline-flex items-center justify-center',
                c.tone === 'indigo' && 'bg-primary text-white',
                c.tone === 'green'  && 'bg-emerald-600 text-white',
                c.tone === 'red'    && 'bg-red-600 text-white'
              )}>
                <Icon name={c.icon} size={22} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Dataset</div>
                <div className="text-[15px] font-semibold tracking-tight">{c.title}</div>
              </div>
            </div>

            <p className="mt-4 text-[13px] text-ink leading-relaxed flex-1">{c.body}</p>

            <div className="mt-4 border-t border-border pt-3 space-y-1.5 text-[12px]">
              {c.meta.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-ink-muted">{k}</span>
                  <span className="font-mono text-ink">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.tags.map(t => <Badge key={t}>{t}</Badge>)}
            </div>

            <div className="mt-5">
              <Button className="w-full justify-center" icon="ArrowRight"
                onClick={() => { setDataset(c.id); setRoute('dashboard'); }}>
                Buka Dashboard
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
            <Icon name="ShieldCheck" size={13} /> Kualitas Data
          </div>
          <h3 className="text-[18px] font-semibold tracking-tight">Tiga prinsip kerja DataKita</h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-[12px]">
            <div>
              <div className="text-primary font-mono text-[20px] font-semibold">100%</div>
              <div className="text-ink-muted">Sumber publik, tanpa data buatan</div>
            </div>
            <div>
              <div className="text-primary font-mono text-[20px] font-semibold">3-lapis</div>
              <div className="text-ink-muted">Cache memori → cache disk → API</div>
            </div>
            <div>
              <div className="text-primary font-mono text-[20px] font-semibold">CORS-aware</div>
              <div className="text-ink-muted">Direct → proxy fallback otomatis</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
            <Icon name="Lightbulb" size={13} /> Untuk siapa?
          </div>
          <h3 className="text-[18px] font-semibold tracking-tight">Warga, jurnalis, mahasiswa, peneliti</h3>
          <p className="mt-3 text-[13px] text-ink-muted">
            Setiap visualisasi dapat diunduh sebagai CSV (Excel/Sheets) atau PDF (laporan resmi). Tabel mendukung pengurutan, pencarian, dan paginasi—siap dipakai untuk artikel, tugas akhir, atau riset kebijakan.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function AboutPage() {
  const team = [
    { name: 'Mahasiswa A', role: 'Lead · Front-end' },
    { name: 'Mahasiswa B', role: 'Data & Visualisasi' },
    { name: 'Mahasiswa C', role: 'API Integration' },
    { name: 'Dosen Pembimbing', role: 'Departement of Informatic and Computer Engineering' }
  ];
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
        <Icon name="Compass" size={13} /> Tentang Proyek
      </div>
      <h1 className="text-[42px] leading-[1.05] font-extrabold tracking-tight text-primary max-w-3xl">
        Membuat data publik Indonesia mudah dibaca, dibagikan, dan dipercaya.
      </h1>
      <p className="mt-4 text-[15px] text-ink-muted max-w-2xl">
        DataKita adalah prototipe dashboard data terbuka yang menggabungkan tiga sumber resmi—BMKG, World Bank, dan Satgas COVID-19—ke dalam satu antarmuka yang berorientasi pada kejelasan editorial dan rigor data.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          { icon: 'Target', t: 'Misi', b: 'Memperpendek jarak antara API publik dan warga negara yang ingin memverifikasi fakta secara mandiri.' },
          { icon: 'Users',  t: 'Audiens', b: 'Jurnalis ruang berita, mahasiswa riset, peneliti kebijakan, dan warga yang penasaran.' },
          { icon: 'Code2',  t: 'Teknologi', b: 'React + Vite, Tailwind CSS, Recharts, TanStack Table, React Query, framer-motion, dan banyak tegukan kopi.' }
        ].map(x => (
          <Card key={x.t} className="p-6" interactive>
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary inline-flex items-center justify-center"><Icon name={x.icon} size={18} /></div>
            <h3 className="mt-3 text-[16px] font-semibold tracking-tight">{x.t}</h3>
            <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">{x.b}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-[22px] font-semibold tracking-tight">Tim</h2>
        <p className="text-[13px] text-ink-muted">Politeknik Elektronika Negeri Surabaya — Departement of Informatic and Computer Engineering</p>
        <div className="mt-5 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {team.map(p => (
            <Card key={p.name} className="p-5 text-center" interactive>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[#3a458f] text-white inline-flex items-center justify-center font-semibold mx-auto mb-3">
                {p.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </div>
              <div className="text-[13px] font-semibold text-ink">{p.name}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">{p.role}</div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-12 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">Lisensi</div>
          <div className="text-[14px] font-semibold mt-0.5">MIT · Gunakan, modifikasi, distribusikan dengan bebas.</div>
        </div>
        <Button variant="outline" icon="Github">Lihat di GitHub</Button>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function CodeBlock({ code, lang = 'json' }) {
  return (
    <pre className="text-[11.5px] bg-[#0f1226] text-[#dde0f5] rounded-lg p-4 overflow-auto max-h-72 font-mono leading-relaxed">{code}</pre>
  );
}

function EndpointCard({ ep }) {
  const [status, setStatus] = React.useState({ state: 'idle', ms: null, sample: null, err: null });

  async function testEndpoint() {
    setStatus({ state: 'loading', ms: null, sample: null, err: null });
    const t0 = performance.now();
    try {
      const data = await apiClient(ep.url);
      const ms = Math.round(performance.now() - t0);
      const sample = JSON.stringify(data, null, 2).slice(0, 1200) + '\n…';
      setStatus({ state: 'ok', ms, sample, err: null });
    } catch (e) {
      const ms = Math.round(performance.now() - t0);
      setStatus({ state: 'error', ms, sample: null, err: e.message });
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="indigo">GET</Badge>
            <Badge>{ep.group}</Badge>
            <span className="text-[14px] font-semibold">{ep.label}</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 max-w-full">
            <code className="text-[12px] text-primary font-mono break-all">{ep.url}</code>
            <button onClick={() => navigator.clipboard.writeText(ep.url)} className="text-ink-muted hover:text-ink"><Icon name="Copy" size={13} /></button>
          </div>
          <p className="mt-2 text-[12px] text-ink-muted max-w-2xl">{ep.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {status.state === 'ok'      && <Badge tone="green"><PulseDot size={5} className="mr-1" /> 200 · {status.ms}ms</Badge>}
          {status.state === 'error'   && <Badge tone="red">ERR · {status.ms}ms</Badge>}
          {status.state === 'loading' && <Badge tone="amber">⋯ Menguji…</Badge>}
          <Button size="sm" variant="outline" icon="Play" onClick={testEndpoint}>Test endpoint</Button>
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">Contoh Respons</div>
          <CodeBlock code={ep.sample} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">Respons Live</div>
          {status.state === 'idle'    && <div className="text-[12px] text-ink-muted p-4 border border-dashed border-border rounded-lg">Klik <span className="font-medium">Test endpoint</span> untuk memanggil API live.</div>}
          {status.state === 'loading' && <div className="h-40 shimmer rounded-lg" />}
          {status.state === 'ok'      && <CodeBlock code={status.sample} />}
          {status.state === 'error'   && <div className="text-[12px] text-red-700 p-4 border border-red-100 rounded-lg bg-red-50">{status.err}</div>}
        </div>
      </div>
    </Card>
  );
}

function ApiDocsPage() {
  const endpoints = [
    {
      group: 'BMKG',
      label: 'Gempa M5.0+ terbaru',
      url: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
      desc: 'Mengembalikan event gempa M≥5.0 paling baru. Strategi CORS: direct → corsproxy.io fallback.',
      sample: JSON.stringify({
        Infogempa: { gempa: { Tanggal: '20 Mei 2026', Jam: '14:23:45 WIB', Magnitude: '5.2', Kedalaman: '10 km', Wilayah: 'Pusat gempa berada di laut 45 km BaratLaut Dompu', Potensi: 'Tidak berpotensi tsunami' } }
      }, null, 2)
    },
    {
      group: 'BMKG',
      label: '15 gempa terkini',
      url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
      desc: 'Daftar 15 event gempa paling baru tanpa ambang batas magnitude.',
      sample: JSON.stringify({ Infogempa: { gempa: [{ Tanggal: '20 Mei 2026', Magnitude: '4.1', Wilayah: '…' }] } }, null, 2)
    },
    {
      group: 'BMKG',
      label: 'Gempa dirasakan',
      url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
      desc: 'Event gempa dengan laporan pengamat manusia (skala MMI).',
      sample: JSON.stringify({ Infogempa: { gempa: [{ Dirasakan: 'III Banda Aceh, IV Sigli' }] } }, null, 2)
    },
    {
      group: 'World Bank',
      label: 'GDP Indonesia (USD)',
      url: 'https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json&per_page=60',
      desc: 'Indikator NY.GDP.MKTP.CD untuk negara IDN. Respons berupa array [meta, data[]].',
      sample: JSON.stringify([{ page: 1, total: 64 }, [{ country: { id: 'ID', value: 'Indonesia' }, date: '2024', value: 1371171836700.42 }]], null, 2)
    },
    {
      group: 'World Bank',
      label: 'Inflasi tahunan',
      url: 'https://api.worldbank.org/v2/country/IDN/indicator/FP.CPI.TOTL.ZG?format=json&per_page=60',
      desc: 'Inflasi consumer prices tahunan (%).',
      sample: JSON.stringify([{ page: 1 }, [{ date: '2023', value: 3.67 }]], null, 2)
    },
    {
      group: 'disease.sh',
      label: 'Indonesia · totals saat ini',
      url: 'https://disease.sh/v3/covid-19/countries/Indonesia',
      desc: 'Akumulasi nasional + today metrics. Field utama: cases, deaths, recovered, active, casesPerOneMillion, population, updated (ms epoch).',
      sample: JSON.stringify({
        country: 'Indonesia',
        cases: 6816041, deaths: 161918, recovered: 6639402, active: 14721,
        casesPerOneMillion: 24588, deathsPerOneMillion: 584,
        population: 277264027, continent: 'Asia',
        updated: 1716196800000
      }, null, 2)
    },
    {
      group: 'disease.sh',
      label: 'Indonesia · historical timeline',
      url: 'https://disease.sh/v3/covid-19/historical/Indonesia?lastdays=all',
      desc: 'Timeline kumulatif sejak 22 Januari 2020. Object dengan key tanggal M/D/YY → nilai akumulatif. Daily new dihitung dengan diff.',
      sample: JSON.stringify({ country: 'Indonesia', timeline: { cases: { '1/22/20': 0, '5/15/26': 6816041 }, deaths: { '1/22/20': 0, '5/15/26': 161918 }, recovered: { '1/22/20': 0, '5/15/26': 6639402 } } }, null, 2)
    },
    {
      group: 'disease.sh',
      label: 'Perbandingan ASEAN',
      url: 'https://disease.sh/v3/covid-19/countries?sort=cases',
      desc: 'Seluruh negara, di-sort. Frontend memfilter ke 6 negara ASEAN (Indonesia, Malaysia, Singapore, Thailand, Philippines, Vietnam) lalu dinormalisasi ke per juta penduduk.',
      sample: JSON.stringify([{ country: 'Indonesia', casesPerOneMillion: 24588, deathsPerOneMillion: 584 }], null, 2)
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-accent text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
          <Icon name="Code2" size={13} /> Referensi API
        </div>
        <h1 className="text-[40px] leading-tight font-extrabold tracking-tight text-primary">Delapan endpoint, satu strategi.</h1>
        <p className="mt-3 text-ink-muted text-[15px]">
          DataKita memanggil endpoint resmi langsung dari browser. Bila preflight CORS gagal,
          klien otomatis mencoba kembali melalui proxy publik <code className="font-mono text-primary">corsproxy.io</code>.
          World Bank dan disease.sh sudah CORS-friendly; fallback umumnya hanya dipakai oleh BMKG.
          Klik <strong>Test endpoint</strong> untuk memanggil API live dan melihat respons asli.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {endpoints.map((ep, i) => <EndpointCard key={i} ep={ep} />)}
      </div>
    </div>
  );
}

Object.assign(window, { DatasetsPage, AboutPage, ApiDocsPage });
