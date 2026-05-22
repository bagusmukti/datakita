import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatasetProvider } from './hooks/useDataset';
import { FiltersProvider } from './hooks/useFilters';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Datasets } from './pages/Datasets';
import { About } from './pages/About';
import { ApiDocs } from './pages/ApiDocs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatasetProvider>
        <FiltersProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/about" element={<About />} />
                <Route path="/api-docs" element={<ApiDocs />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </FiltersProvider>
      </DatasetProvider>
    </QueryClientProvider>
  );
}
