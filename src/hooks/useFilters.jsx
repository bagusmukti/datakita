import { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  search: '',
  dateStart: null,
  dateEnd: null,
  region: 'all',
  category: 'all',
  indicator: 'gdp',
};

function filtersReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateStart: action.payload.start, dateEnd: action.payload.end };
    case 'SET_REGION':
      return { ...state, region: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_INDICATOR':
      return { ...state, indicator: action.payload };
    case 'RESET':
      return { ...initialState };
    case 'REMOVE':
      return { ...state, [action.key]: initialState[action.key] };
    default:
      return state;
  }
}

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, dispatch] = useReducer(filtersReducer, initialState);

  const setSearch = useCallback((v) => dispatch({ type: 'SET_SEARCH', payload: v }), []);
  const setDateRange = useCallback((start, end) => dispatch({ type: 'SET_DATE_RANGE', payload: { start, end } }), []);
  const setRegion = useCallback((v) => dispatch({ type: 'SET_REGION', payload: v }), []);
  const setCategory = useCallback((v) => dispatch({ type: 'SET_CATEGORY', payload: v }), []);
  const setIndicator = useCallback((v) => dispatch({ type: 'SET_INDICATOR', payload: v }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'RESET' }), []);
  const removeFilter = useCallback((key) => dispatch({ type: 'REMOVE', key }), []);

  const activeChips = [];
  if (filters.search) activeChips.push({ key: 'search', label: `Cari: "${filters.search}"` });
  if (filters.region !== 'all') activeChips.push({ key: 'region', label: `Wilayah: ${filters.region}` });
  if (filters.category !== 'all') activeChips.push({ key: 'category', label: `Kategori: ${filters.category}` });
  if (filters.dateStart) activeChips.push({ key: 'dateStart', label: `Dari: ${filters.dateStart}` });
  if (filters.dateEnd) activeChips.push({ key: 'dateEnd', label: `Hingga: ${filters.dateEnd}` });

  return (
    <FiltersContext.Provider
      value={{ filters, activeChips, setSearch, setDateRange, setRegion, setCategory, setIndicator, resetFilters, removeFilter }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) throw new Error('useFilters must be used within FiltersProvider');
  return context;
}
