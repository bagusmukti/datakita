import { createContext, useContext, useState } from 'react';
import { CloudSun, TrendingUp, Activity } from 'lucide-react';

export const DATASETS = {
  bmkg: {
    id: 'bmkg',
    name: 'Gempa & Cuaca',
    nameEn: 'Earthquakes & Weather',
    fullName: 'Gempa Bumi & Prakiraan Cuaca Indonesia',
    source: 'BMKG',
    sourceUrl: 'https://data.bmkg.go.id',
    description: 'Data gempa bumi terkini (magnitudo, kedalaman, potensi tsunami) dan prakiraan cuaca per provinsi dari BMKG.',
    icon: CloudSun,
    color: '#1E2761',
    accentColor: '#A8C5E0',
  },
  worldbank: {
    id: 'worldbank',
    name: 'Ekonomi Indonesia',
    nameEn: 'Indonesia Economy',
    fullName: 'Indikator Ekonomi Indonesia',
    source: 'World Bank',
    sourceUrl: 'https://data.worldbank.org',
    description: 'Indikator ekonomi makro Indonesia dari World Bank Open Data: GDP, inflasi, populasi, dan pengangguran.',
    icon: TrendingUp,
    color: '#1E2761',
    accentColor: '#F5A623',
  },
  disease: {
    id: 'disease',
    name: 'COVID-19 Indonesia',
    nameEn: 'COVID-19 Indonesia',
    fullName: 'Data Historis COVID-19 Indonesia',
    source: 'disease.sh',
    sourceUrl: 'https://disease.sh',
    description: 'Data historis COVID-19 Indonesia mencakup kasus, kematian, dan pemulihan dari disease.sh API.',
    icon: Activity,
    color: '#DC2626',
    accentColor: '#FCA5A5',
  },
};

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const [activeDataset, setActiveDataset] = useState('bmkg');

  return (
    <DatasetContext.Provider
      value={{
        activeDataset,
        setActiveDataset,
        datasets: DATASETS,
        currentDataset: DATASETS[activeDataset],
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) throw new Error('useDataset must be used within DatasetProvider');
  return context;
}
