import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FormData, initialFormData } from '../types';

interface GlobalContextType {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(initialFormData);

  const updateData = (fields: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <GlobalContext.Provider value={{ data, updateData, setData }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}
