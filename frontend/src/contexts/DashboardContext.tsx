import React, { createContext, useContext } from 'react';

interface DashboardContextType {
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSymbol, setSelectedSymbol] = React.useState<string | null>(null);

  return (
    <DashboardContext.Provider 
      value={{ 
        selectedSymbol, 
        setSelectedSymbol
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};