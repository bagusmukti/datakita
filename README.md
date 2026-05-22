<div align="center">

# 🇮🇩 DataKita

### Dashboard Visualisasi Data Publik Indonesia

*Mengubah data mentah pemerintah menjadi insight yang mudah dipahami masyarakat.*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

[Demo](#-demo) · [Fitur](#-fitur-utama) · [Instalasi](#-instalasi--menjalankan) · [API](#-sumber-data-api) · [Tim](#-tim-pengembang)

</div>

---

## 📖 Tentang Proyek

**DataKita** adalah aplikasi web *open-data dashboard* yang mengagregasi data publik dari tiga sumber API berbeda — **BMKG**, **World Bank**, dan **disease.sh** — kemudian menyajikannya dalam bentuk visualisasi yang interaktif dan mudah dipahami.

### 🎯 Latar Belakang Masalah

> *"Data publik tersedia, tapi sulit dipahami masyarakat."*

Pemerintah dan lembaga internasional sudah menyediakan banyak data publik secara gratis melalui API. Namun, datanya umumnya disajikan dalam format JSON mentah — penuh kode, struktur nested, dan istilah teknis — yang sulit dipahami oleh masyarakat awam.

**DataKita hadir sebagai jembatan**, mengubah data JSON mentah menjadi grafik, tabel, dan insight yang dapat dibaca siapa saja: wartawan, mahasiswa, peneliti, hingga warga biasa.

### 💡 Solusi

DataKita menyediakan satu dashboard terpadu yang:
- 📥 **Mengambil** data realtime dari API publik (JSON)
- 📊 **Menampilkan** data dalam bentuk grafik & tabel interaktif
- 🔍 **Memfilter** dan mencari data sesuai kebutuhan
- 📁 **Mengekspor** data ke format CSV atau PDF
- 🌐 **Menyatukan** tiga domain data berbeda (cuaca/gempa, ekonomi, kesehatan) dalam satu platform

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🌦️ **Multi-Dataset** | Switch antara 3 sumber data: BMKG, World Bank, disease.sh |
| 📈 **Visualisasi Interaktif** | Line chart, area chart, bar chart, dan donut chart berbasis Recharts |
| 🔎 **Filter & Pencarian** | Filter berdasarkan tanggal, wilayah, kategori dengan filter chips |
| 📋 **Tabel Data Lengkap** | Sortable, paginated, searchable dengan TanStack Table |
| 📤 **Export Data** | Download data ke CSV (PapaParse) atau PDF (jsPDF + html2canvas) |
| 🧠 **Auto-Insights** | Insight otomatis dihasilkan dari data aktif |
| 📱 **Fully Responsive** | Berfungsi sempurna di desktop hingga mobile (375px) |
| ⚡ **Fast & Cached** | Powered by React Query untuk fetching, caching, dan retry |
| 🎨 **Editorial Design** | Inspirasi dari Our World in Data — bersih, profesional, *trustworthy* |

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://react.dev/)** — UI library
- **[Vite](https://vitejs.dev/)** — Build tool & dev server
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[React Router](https://reactrouter.com/)** — Client-side routing

### Data & State
- **[TanStack Query](https://tanstack.com/query)** — Server state, caching, retry
- **[Axios](https://axios-http.com/)** — HTTP client dengan CORS fallback
- **[TanStack Table](https://tanstack.com/table)** — Headless table primitives

### Visualisasi
- **[Recharts](https://recharts.org/)** — Chart library berbasis D3
- **[Lucide React](https://lucide.dev/)** — Icon set modern

### Utilitas
- **[date-fns](https://date-fns.org/)** — Date formatting dengan locale `id`
- **[PapaParse](https://www.papaparse.com/)** — CSV parsing & generation
- **[jsPDF](https://github.com/parallax/jsPDF)** + **[html2canvas](https://html2canvas.hertzen.com/)** — PDF export
- **[Framer Motion](https://www.framer.com/motion/)** — Animasi UI

---

## 🌐 Sumber Data (API)

DataKita mengintegrasikan **tiga API publik real-time**:

### 1. 🌪️ BMKG — Cuaca & Aktivitas Seismik
**Base URL:** `https://data.bmkg.go.id/`

| Endpoint | Deskripsi |
|---|---|
| `/DataMKG/TEWS/autogempa.json` | Gempa terbaru (M5.0+) |
| `/DataMKG/TEWS/gempaterkini.json` | 15 gempa terkini |
| `/DataMKG/TEWS/gempadirasakan.json` | Gempa yang dirasakan |
| `api.bmkg.go.id/publik/prakiraan-cuaca` | Prakiraan cuaca per provinsi |

> ⚠️ BMKG memiliki keterbatasan CORS. Aplikasi menggunakan fallback proxy otomatis (`corsproxy.io`).

### 2. 💹 World Bank — Indikator Ekonomi Indonesia
**Base URL:** `https://api.worldbank.org/v2/`

| Indikator | Endpoint |
|---|---|
| GDP (US$) | `/country/IDN/indicator/NY.GDP.MKTP.CD` |
| GDP per Kapita | `/country/IDN/indicator/NY.GDP.PCAP.CD` |
| Inflasi (%) | `/country/IDN/indicator/FP.CPI.TOTL.ZG` |
| Populasi | `/country/IDN/indicator/SP.POP.TOTL` |
| Pengangguran (%) | `/country/IDN/indicator/SL.UEM.TOTL.ZS` |

### 3. 🏥 disease.sh — Data Historis COVID-19 Indonesia
**Base URL:** `https://disease.sh/v3/covid-19/`

| Endpoint | Deskripsi |
|---|---|
| `/countries/Indonesia` | Statistik kumulatif Indonesia |
| `/historical/Indonesia?lastdays=all` | Time-series lengkap |
| `/countries?sort=cases` | Komparasi negara ASEAN |
| `/continents/Asia` | Konteks regional Asia |

> ✅ disease.sh **fully CORS-enabled**, tidak perlu API key, dan menjadi *fallback* setelah API resmi `data.covid19.go.id` mengembalikan error 403.

---

## 📁 Struktur Proyek

```
datakita/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # Router + QueryClient setup
│   ├── index.css                  # Tailwind + CSS variables
│   ├── lib/
│   │   ├── utils.js               # Helper (cn, formatters)
│   │   ├── apiClient.js           # Axios instance + CORS fallback
│   │   └── exportHelpers.js       # CSV & PDF export logic
│   ├── services/
│   │   ├── bmkgService.js
│   │   ├── worldBankService.js
│   │   └── diseaseService.js
│   ├── hooks/
│   │   ├── useDataset.js
│   │   ├── useFilters.js
│   │   ├── useBmkgData.js
│   │   ├── useWorldBankData.js
│   │   └── useDiseaseData.js
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, Layout
│   │   ├── dashboard/             # HeroHeader, FilterBar, Charts, Table, Modal
│   │   └── ui/                    # Card, Button, Badge, PulseDot, etc.
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Datasets.jsx
│       ├── About.jsx
│       └── ApiDocs.jsx
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat
- **Node.js** >= 18.x
- **npm** >= 9.x (atau pnpm / yarn)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/your-username/datakita-dashboard.git
cd datakita-dashboard

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Buka di browser
# http://localhost:5173
```

### Script yang Tersedia

| Command | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan dev server di `localhost:5173` |
| `npm run build` | Build production ke folder `dist/` |
| `npm run preview` | Preview hasil build secara lokal |
| `npm run lint` | Menjalankan ESLint |

---

## 🎨 Design System

| Token | Value | Penggunaan |
|---|---|---|
| Primary | `#1E2761` | Indigo — header, tombol utama |
| Accent | `#F5A623` | Amber — CTA, highlight |
| Supporting | `#A8C5E0` | Sky — chart sekunder |
| Background | `#FAFAF7` | Warm off-white |
| Surface | `#FFFFFF` | Card |

**Typography:** Inter (heading + body) · JetBrains Mono (data & numbers)

---

## 🎓 Konteks Akademik

**Tema Tugas:** *Teknologi Aplikasi Web Basis Data Internet (JSON) — Dashboard Data Publik (Open Data)*

### Sasaran Pembelajaran
- Memahami konsumsi API publik dengan format JSON
- Implementasi data visualization dengan chart library
- Penerapan filter, pencarian, dan ekspor data
- Eksplorasi tren teknologi web modern

---

## 📚 Referensi

### Dokumentasi API
- [BMKG Open Data](https://data.bmkg.go.id/)
- [World Bank API Documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
- [disease.sh API Docs](https://disease.sh/docs/)

### Dokumentasi Library
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Recharts API](https://recharts.org/en-US/api)
- [TanStack Query](https://tanstack.com/query/latest/docs)

### Bacaan Pendukung
- Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. Graphics Press.
- Few, S. (2006). *Information Dashboard Design: The Effective Visual Communication of Data*. O'Reilly.
- [Open Data Charter](https://opendatacharter.net/)
- [Satu Data Indonesia](https://data.go.id/)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Jika ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/fitur-keren`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur keren'`)
4. Push ke branch (`git push origin feature/fitur-keren`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---

## 🙏 Acknowledgments

- 🌍 **BMKG** — atas data cuaca dan gempa publik
- 💼 **World Bank** — atas data indikator ekonomi global
- 🏥 **disease.sh** — atas open API data COVID-19
- 💡 **Our World in Data** — sebagai inspirasi desain dashboard

---

<div align="center">

**Dibuat dengan ❤️**

⭐ Star repo ini jika kamu menemukan project ini bermanfaat!

</div>