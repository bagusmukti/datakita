import { Target, Code2, BookOpen, Globe, Shield } from 'lucide-react';

const techStack = [
  { name: 'React 18', desc: 'UI library' },
  { name: 'Vite 5', desc: 'Build tool' },
  { name: 'Tailwind CSS', desc: 'Styling' },
  { name: 'Recharts', desc: 'Visualisasi data' },
  { name: 'React Query', desc: 'Server state & caching' },
  { name: 'Framer Motion', desc: 'Animasi' },
  { name: 'TanStack Table', desc: 'Data table' },
  { name: 'Lucide Icons', desc: 'Icon library' },
  { name: 'date-fns', desc: 'Format tanggal' },
  { name: 'Axios', desc: 'HTTP client' },
  { name: 'PapaParse', desc: 'CSV export' },
  { name: 'jsPDF + html2canvas', desc: 'PDF export' },
];

const targetUsers = [
  { icon: Globe, title: 'Masyarakat Umum', desc: 'Memahami kondisi cuaca, gempa, dan kesehatan Indonesia secara visual dan mudah dipahami.' },
  { icon: BookOpen, title: 'Mahasiswa & Peneliti', desc: 'Mengakses data publik resmi dengan mudah untuk keperluan penelitian dan tugas akhir.' },
  { icon: Code2, title: 'Jurnalis Data', desc: 'Mendapatkan visualisasi siap pakai untuk mendukung liputan berbasis data.' },
  { icon: Shield, title: 'Pemangku Kebijakan', desc: 'Memantau tren ekonomi dan kesehatan nasional secara ringkas dan terpercaya.' },
];

const dataSources = [
  {
    name: 'BMKG',
    url: 'https://data.bmkg.go.id',
    desc: 'Badan Meteorologi, Klimatologi, dan Geofisika — data gempa bumi realtime: magnitudo, kedalaman, lokasi, dan potensi tsunami.',
  },
  {
    name: 'Open-Meteo',
    url: 'https://open-meteo.com',
    desc: 'Open-source weather API — prakiraan cuaca per jam seluruh Indonesia: suhu, kelembapan, kecepatan angin, dan jarak pandang. Gratis, tanpa kunci API.',
  },
  {
    name: 'World Bank',
    url: 'https://data.worldbank.org',
    desc: 'Open Data World Bank — indikator ekonomi makro Indonesia sejak 1960: GDP, inflasi, populasi, dan pengangguran.',
  },
  {
    name: 'disease.sh',
    url: 'https://disease.sh',
    desc: 'Open Disease Data API — riwayat COVID-19 Indonesia sejak Januari 2020 dengan data harian dan perbandingan ASEAN.',
  },
];

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Tentang Proyek</span>
        <h1 className="text-3xl font-extrabold text-primary mt-2 tracking-tight">DataKita</h1>
        <p className="text-lg text-text-secondary mt-3 leading-relaxed">
          Dashboard visualisasi data publik Indonesia yang mengagregasi informasi dari BMKG, World Bank, dan disease.sh ke dalam satu antarmuka yang bersih, informatif, dan mudah digunakan.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-accent" />
          <h2 className="font-bold text-text-primary">Misi Proyek</h2>
        </div>
        <p className="text-text-secondary leading-relaxed text-sm">
          DataKita hadir untuk menjembatani kesenjangan antara data publik yang tersedia dan kemampuan masyarakat untuk mengaksesnya. Data dari BMKG, World Bank, dan sumber kesehatan global sebenarnya terbuka dan gratis — namun sering kali tersebar, sulit diakses, dan tidak ramah pengguna umum. DataKita mengintegrasikan semua ini dalam satu platform dengan visualisasi yang jelas dan narasi data yang bermakna.
        </p>
      </div>

      <div>
        <h2 className="font-bold text-text-primary mb-5 text-lg">Pengguna Target</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {targetUsers.map((u) => (
            <div key={u.title} className="bg-surface rounded-xl border border-border p-5 flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <u.icon size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">{u.title}</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-text-primary mb-5 text-lg">Sumber Data</h2>
        <div className="space-y-3">
          {dataSources.map((s) => (
            <div key={s.name} className="bg-surface rounded-xl border border-border p-5 flex gap-4 items-start">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">{s.name.slice(0, 2)}</span>
              </div>
              <div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary text-sm hover:underline"
                >
                  {s.name}
                </a>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-text-primary mb-5 text-lg">Teknologi yang Digunakan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {techStack.map((t) => (
            <div key={t.name} className="bg-surface rounded-lg border border-border p-3">
              <p className="font-mono font-semibold text-primary text-sm">{t.name}</p>
              <p className="text-xs text-text-secondary mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
