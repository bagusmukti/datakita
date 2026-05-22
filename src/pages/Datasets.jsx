import { useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { useDataset, DATASETS } from '../hooks/useDataset';
import { useBmkgData } from '../hooks/useBmkgData';
import { useWorldBankData } from '../hooks/useWorldBankData';
import { useDiseaseData } from '../hooks/useDiseaseData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PulseDot } from '../components/ui/PulseDot';

export function Datasets() {
  const { setActiveDataset } = useDataset();
  const navigate = useNavigate();
  const bmkg = useBmkgData();
  const wb = useWorldBankData();
  const disease = useDiseaseData();

  function openDataset(id) {
    setActiveDataset(id);
    navigate('/');
  }

  const cards = [
    {
      ds: DATASETS.bmkg,
      status: bmkg.isLoading ? 'loading' : bmkg.isError ? 'error' : 'ok',
      meta: bmkg.latest ? `Gempa terkini: M${bmkg.latest.magnitude}` : 'Memuat…',
      endpoints: [
        'data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
        'data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
        'data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
        'api.bmkg.go.id/publik/prakiraan-cuaca?adm1={kode}',
      ],
    },
    {
      ds: DATASETS.worldbank,
      status: wb.isLoading ? 'loading' : wb.isError ? 'error' : 'ok',
      meta: wb.latest?.year ? `Data terbaru: tahun ${wb.latest.year}` : 'Memuat…',
      endpoints: [
        'api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD',
        'api.worldbank.org/v2/country/IDN/indicator/NY.GDP.PCAP.CD',
        'api.worldbank.org/v2/country/IDN/indicator/FP.CPI.TOTL.ZG',
        'api.worldbank.org/v2/country/IDN/indicator/SP.POP.TOTL',
        'api.worldbank.org/v2/country/IDN/indicator/SL.UEM.TOTL.ZS',
      ],
    },
    {
      ds: DATASETS.disease,
      status: disease.isLoading ? 'loading' : disease.isError ? 'error' : 'ok',
      meta: disease.current?.cases ? `Total kasus: ${disease.current.cases.toLocaleString('id-ID')}` : 'Memuat…',
      endpoints: [
        'disease.sh/v3/covid-19/countries/Indonesia',
        'disease.sh/v3/covid-19/historical/Indonesia?lastdays=all',
        'disease.sh/v3/covid-19/countries?sort=cases',
        'disease.sh/v3/covid-19/continents/Asia',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Sumber Data</span>
        <h1 className="text-3xl font-extrabold text-primary mt-2 tracking-tight">Dataset yang Tersedia</h1>
        <p className="text-text-secondary mt-2 max-w-xl">
          DataKita mengagregasi data dari tiga API publik terpercaya. Semua data bebas diakses tanpa biaya dan tidak memerlukan kunci API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ ds, status, meta, endpoints }) => (
          <div key={ds.id} className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ds.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text-primary truncate">{ds.name}</h3>
                  {status === 'ok' && <PulseDot color="green" size="sm" />}
                  {status === 'error' && <PulseDot color="red" size="sm" pulse={false} />}
                  {status === 'loading' && <PulseDot color="amber" size="sm" />}
                </div>
                <p className="text-xs text-text-secondary">{ds.source}</p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
              <p className="text-sm text-text-secondary leading-relaxed">{ds.description}</p>

              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock size={12} />
                <span className="font-mono">{meta}</span>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-2">Endpoint</p>
                <div className="space-y-1">
                  {endpoints.map((ep) => (
                    <p key={ep} className="text-[11px] font-mono text-text-secondary bg-bg rounded px-2 py-1 border border-border/50 truncate" title={ep}>
                      {ep}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <Button variant="primary" size="sm" className="flex-1 gap-1" onClick={() => openDataset(ds.id)}>
                Buka Dashboard
                <ArrowRight size={13} />
              </Button>
              <a href={ds.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink size={12} />
                  API
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
