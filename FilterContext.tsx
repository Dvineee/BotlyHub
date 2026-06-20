
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FilterType = 'all' | 'paid' | 'free' | 'bhub' | 'popular';
export type SearchModeType = 'bots' | 'apps';

interface FilterContextType {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  searchMode: SearchModeType;
  setSearchMode: (mode: SearchModeType) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchMode, setSearchMode] = useState<SearchModeType>(() => {
    if (typeof window !== 'undefined') {
      const mode = new URLSearchParams(window.location.search).get("mode");
      if (mode === 'bots' || mode === 'apps') {
        return mode;
      }
    }
    return 'bots';
  });

  return (
    <FilterContext.Provider value={{ activeFilter, setActiveFilter, searchMode, setSearchMode }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
