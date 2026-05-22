import { useState } from 'react';
import { ExternalLink, Play, Copy, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import client from '../lib/apiClient';

const APIS = [
  {
    id: 'bmkg-latest',
    source: 'BMKG',
    name: 'Gempa Terbaru (M5.0+)',
    method: 'GET',
    url: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
    description: 'Mengembalikan satu data gempa terbaru dengan magnitudo ≥5.0. Diperbarui otomatis saat ada gempa baru.',
    corsNote: 'BMKG mungkin memiliki pembatasan CORS. DataKita menggunakan fallback ke corsproxy.io secara otomatis.',
    sampleResponse: `{
  "Infogempa": {
    "gempa": {
      "Tanggal": "20 Mei 2026",
      "Jam": "14:23:45 WIB",
      "DateTime": "2026-05-20T07:23:45+00:00",
      "Coordinates": "-8.45,118.32",
      "Lintang": "8.45 LS",
      "Bujur": "118.32 BT",
      "Magnitude": "5.2",
      "Kedalaman": "10 km",
      "Wilayah": "Pusat gempa berada di laut 45 km BaratLaut Dompu",
      "Potensi": "Tidak berpotensi tsunami"
    }
  }
}`,
  },
  {
    id: 'bmkg-recent',
    source: 'BMKG',
    name: '15 Gempa Terkini',
    method: 'GET',
    url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
    description: 'Mengembalikan array 15 kejadian gempa terkini dari seluruh wilayah Indonesia.',
    corsNote: 'BMKG mungkin memiliki pembatasan CORS.',
    sampleResponse: `{
  "Infogempa": {
    "gempa": [
      { "Tanggal": "20 Mei 2026", "Magnitude": "3.1", ... },
      { "Tanggal": "20 Mei 2026", "Magnitude": "4.5", ... }
    ]
  }
}`,
  },
  {
    id: 'worldbank-gdp',
    source: 'World Bank',
    name: 'GDP Indonesia',
    method: 'GET',
    url: 'https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json&per_page=60',
    description: 'GDP Indonesia dalam dolar AS saat ini. Mencakup data historis 60 tahun terakhir.',
    corsNote: 'World Bank API memiliki CORS header yang benar. Tidak memerlukan proxy.',
    sampleResponse: `[
  { "page": 1, "pages": 1, "per_page": 60, "total": 64 },
  [
    {
      "country": { "id": "ID", "value": "Indonesia" },
      "indicator": { "id": "NY.GDP.MKTP.CD", "value": "GDP (current US$)" },
      "date": "2023",
      "value": 1319100319396.30
    }
  ]
]`,
  },
  {
    id: 'disease-current',
    source: 'disease.sh',
    name: 'COVID-19 Indonesia — Data Terkini',
    method: 'GET',
    url: 'https://disease.sh/v3/covid-19/countries/Indonesia',
    description: 'Statistik COVID-19 Indonesia terkini: total kasus, kematian, pemulihan, aktif, dan kritis.',
    corsNote: 'disease.sh fully CORS-enabled. Tidak memerlukan API key.',
    sampleResponse: `{
  "country": "Indonesia",
  "cases": 6816041,
  "deaths": 161918,
  "recovered": 6639402,
  "active": 14721,
  "casesPerOneMillion": 24588,
  "deathsPerOneMillion": 584,
  "population": 277264027
}`,
  },
  {
    id: 'disease-historical',
    source: 'disease.sh',
    name: 'COVID-19 Indonesia — Historis',
    method: 'GET',
    url: 'https://disease.sh/v3/covid-19/historical/Indonesia?lastdays=all',
    description: 'Riwayat COVID-19 Indonesia sejak Januari 2020 dalam format timeline kumulatif.',
    corsNote: 'disease.sh fully CORS-enabled.',
    sampleResponse: `{
  "country": "Indonesia",
  "timeline": {
    "cases": { "1/22/20": 0, "3/2/20": 2, ... },
    "deaths": { "1/22/20": 0, "3/2/20": 0, ... },
    "recovered": { "1/22/20": 0, "3/2/20": 0, ... }
  }
}`,
  },
];

export function ApiDocs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Dokumentasi</span>
        <h1 className="text-3xl font-extrabold text-primary mt-2 tracking-tight">Referensi API</h1>
        <p className="text-text-secondary mt-2">
          Semua endpoint yang digunakan DataKita. Klik "Uji Endpoint" untuk memanggil API secara langsung dari browser.
        </p>
      </div>

      <div className="space-y-4">
        {APIS.map((api) => (
          <ApiCard key={api.id} api={api} />
        ))}
      </div>
    </div>
  );
}

function ApiCard({ api }) {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function testEndpoint() {
    setTesting(true);
    setError(null);
    setResponse(null);
    const t0 = performance.now();
    try {
      const res = await client.get(api.url, { timeout: 10000 });
      const t1 = performance.now();
      setResponseTime(Math.round(t1 - t0));
      setResponse(res.data);
    } catch (err) {
      setError(err.message || 'Request gagal');
    } finally {
      setTesting(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(api.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const sourceVariant = api.source === 'BMKG' ? 'primary' : api.source === 'World Bank' ? 'accent' : 'success';

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        className="w-full flex flex-wrap items-start gap-3 p-5 text-left hover:bg-gray-50/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <Badge variant={sourceVariant}>{api.source}</Badge>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm">{api.name}</p>
          <p className="text-xs text-text-secondary mt-0.5 truncate font-mono">{api.url}</p>
        </div>
        <Badge variant="default" className="shrink-0">{api.method}</Badge>
        <span className="text-text-secondary">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <p className="text-sm text-text-secondary">{api.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-0 bg-bg rounded-lg border border-border px-3 py-2 flex items-center gap-2">
              <code className="text-xs font-mono text-text-secondary truncate flex-1">{api.url}</code>
              <button onClick={copyUrl} className="text-text-secondary hover:text-primary transition-colors shrink-0">
                {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
              <a href={api.url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors shrink-0">
                <ExternalLink size={13} />
              </a>
            </div>
            <Button variant="secondary" size="sm" onClick={testEndpoint} disabled={testing} className="gap-1.5 shrink-0">
              {testing ? <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <Play size={12} />}
              {testing ? 'Menguji…' : 'Uji Endpoint'}
            </Button>
          </div>

          {api.corsNote && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
              <p className="text-xs text-yellow-700"><span className="font-semibold">CORS:</span> {api.corsNote}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Contoh Respons</p>
            <pre className="bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
              {api.sampleResponse}
            </pre>
          </div>

          {(response || error) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Respons Live</p>
                {responseTime && (
                  <span className="flex items-center gap-1 text-xs text-success font-mono">
                    <Clock size={11} />{responseTime}ms
                  </span>
                )}
                {error && <Badge variant="danger">Error</Badge>}
                {response && <Badge variant="success">200 OK</Badge>}
              </div>
              {error ? (
                <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 text-xs font-mono text-danger">{error}</div>
              ) : (
                <pre className="bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto max-h-60 whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2).slice(0, 2000)}
                  {JSON.stringify(response).length > 2000 ? '\n…(dipotong)' : ''}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
