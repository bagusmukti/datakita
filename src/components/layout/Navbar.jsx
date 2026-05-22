import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CloudSun, TrendingUp, Activity, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataset, DATASETS } from '../../hooks/useDataset';
import { Dropdown } from '../ui/Dropdown';
import { PulseDot } from '../ui/PulseDot';
import { cn } from '../../lib/utils';

const datasetOptions = [
  { value: 'bmkg', label: 'Cuaca & Gempa', icon: CloudSun, description: 'BMKG' },
  { value: 'worldbank', label: 'Ekonomi Indonesia', icon: TrendingUp, description: 'World Bank' },
  { value: 'disease', label: 'COVID-19 Indonesia', icon: Activity, description: 'disease.sh' },
];

const navLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/datasets', label: 'Dataset' },
  { to: '/about', label: 'Tentang' },
  { to: '/api-docs', label: 'API Docs' },
];

export function Navbar() {
  const { activeDataset, setActiveDataset } = useDataset();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleDatasetChange(id) {
    setActiveDataset(id);
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
          <DataKitaLogo />
          <span className="font-bold text-primary text-[17px] tracking-tight hidden sm:block">DataKita</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Dropdown
              options={datasetOptions}
              value={activeDataset}
              onChange={handleDatasetChange}
              align="right"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-success/10 border border-success/20">
            <PulseDot color="green" size="sm" />
            <span className="text-xs font-medium text-success">Terhubung</span>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-text-secondary"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-16 inset-x-0 bg-surface border-b border-border shadow-lg z-50 p-4 space-y-1"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-text-secondary px-3 mb-1 font-medium uppercase tracking-wider">Dataset Aktif</p>
              {datasetOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { handleDatasetChange(opt.value); setMobileOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeDataset === opt.value ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'
                  )}
                >
                  <opt.icon size={14} />
                  {opt.label}
                  <span className="ml-auto text-xs opacity-60">{opt.description}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function DataKitaLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#1E2761" />
      <rect x="5" y="18" width="4" height="5" rx="1" fill="#F5A623" />
      <rect x="11" y="13" width="4" height="10" rx="1" fill="#A8C5E0" />
      <rect x="17" y="8" width="4" height="15" rx="1" fill="white" />
      <path d="M7 17L13 12L19 7" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
