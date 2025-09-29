import { useState, useCallback } from 'react';

interface UseLoaderReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useLoader(initialState: boolean = false): UseLoaderReturn {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async (asyncFn: () => Promise<any>): Promise<any> => {
    try {
      setIsLoading(true);
      const result = await asyncFn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}

// Global loading context for app-wide loading states
import React, { createContext, useContext, ReactNode } from 'react';

interface LoadingContextType {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  return (
    <LoadingContext.Provider value={{
      globalLoading,
      setGlobalLoading,
      loadingMessage,
      setLoadingMessage
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a LoadingProvider');
  }
  return context;
}