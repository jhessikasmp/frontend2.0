import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ValueVisibilityContextType {
  showValues: boolean;
  setShowValues: (v: boolean) => void;
}

const ValueVisibilityContext = createContext<ValueVisibilityContextType | undefined>(undefined);

export const ValueVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [showValues, setShowValues] = useState(true);
  return (
    <ValueVisibilityContext.Provider value={{ showValues, setShowValues }}>
      {children}
    </ValueVisibilityContext.Provider>
  );
};

export const useValueVisibility = () => {
  const context = useContext(ValueVisibilityContext);
  if (!context) throw new Error('useValueVisibility must be used within ValueVisibilityProvider');
  return context;
};
