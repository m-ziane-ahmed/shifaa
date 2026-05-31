"use client";

import { createContext, useContext, useState } from "react";

type SearchContextType = {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const SearchContext = createContext<SearchContextType>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchContext.Provider value={{
      isOpen,
      openSearch: () => setIsOpen(true),
      closeSearch: () => setIsOpen(false),
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
