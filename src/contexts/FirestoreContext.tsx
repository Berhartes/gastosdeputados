import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firestoreService } from '@/services/firestore-service';
import { useToast } from '@/hooks/use-toast';

interface FirestoreFilters {
  ano: number;
  mes: number | string;
  uf?: string;
  partido?: string;
}

interface FirestoreContextData {
  data: any | null;
  loading: boolean;
  error: string | null;
  filters: FirestoreFilters;
  setFilters: (filters: Partial<FirestoreFilters>) => void;
  refetch: () => Promise<void>;
  isConnected: boolean;
}

const FirestoreContext = createContext<FirestoreContextData>({} as FirestoreContextData);

interface FirestoreProviderProps {
  children: ReactNode;
}

export function FirestoreProvider({ children }: FirestoreProviderProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();
  
  const [filters, setFiltersState] = useState<FirestoreFilters>({
    ano: new Date().getFullYear(),
    mes: 'todos',
    uf: undefined,
    partido: undefined
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('FirestoreContext: Carregando dados com filtros:', filters);
      
      const result = await firestoreService.buscarDadosCompletos(filters);
      setData(result);
      setIsConnected(true);
      
      // Salvar no localStorage
      localStorage.setItem('ultima-analise', JSON.stringify(result));
      localStorage.setItem('firestore-filters', JSON.stringify(filters));
      localStorage.setItem('fonte-dados', 'firestore');
      
    } catch (err: any) {
      console.error('FirestoreContext: Erro ao carregar dados:', err);
      setError(err.message);
      setIsConnected(false);
      
      // Tentar carregar do cache
      const cached = localStorage.getItem('ultima-analise');
      if (cached) {
        setData(JSON.parse(cached));
        toast({
          title: "Modo offline",
          description: "Usando dados salvos localmente",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    // Tentar restaurar filtros salvos
    const savedFilters = localStorage.getItem('firestore-filters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFiltersState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Erro ao restaurar filtros:', e);
      }
    }
    
    loadData();
  }, []); // Apenas na montagem inicial

  // Recarregar quando filtros mudarem
  useEffect(() => {
    loadData();
  }, [filters.ano, filters.mes, filters.uf, filters.partido]);

  const setFilters = (newFilters: Partial<FirestoreFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const value: FirestoreContextData = {
    data,
    loading,
    error,
    filters,
    setFilters,
    refetch: loadData,
    isConnected
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  
  if (!context) {
    throw new Error('useFirestore deve ser usado dentro de um FirestoreProvider');
  }
  
  return context;
};

// Hook auxiliar para acessar apenas os deputados
export const useDeputadosFirestore = () => {
  const { data, loading, error } = useFirestore();
  
  return {
    deputados: data?.analise?.deputadosAnalise || [],
    loading,
    error
  };
};

// Hook auxiliar para acessar apenas os alertas
export const useAlertasFirestore = () => {
  const { data, loading, error } = useFirestore();
  
  return {
    alertas: data?.analise?.alertas || [],
    loading,
    error
  };
};

// Hook auxiliar para acessar estatísticas
export const useEstatisticasFirestore = () => {
  const { data, loading, error } = useFirestore();
  
  return {
    estatisticas: data?.analise?.estatisticas || null,
    loading,
    error
  };
};
