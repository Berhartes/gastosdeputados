import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '@/services/firestore-service';
import { useToast } from '@/hooks/use-toast';

interface UseFirestoreDataOptions {
  ano?: number;
  mes?: number | string;
  uf?: string;
  partido?: string;
  autoLoad?: boolean;
}

export function useFirestoreData(options?: UseFirestoreDataOptions) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando dados do Firestore com opções:', options);
      
      const result = await firestoreService.buscarDadosCompletos({
        ano: options?.ano || new Date().getFullYear(),
        mes: options?.mes || 'todos',
        uf: options?.uf,
        partido: options?.partido
      });
      
      setData(result);
      
      // Salvar no localStorage como fallback
      localStorage.setItem('ultima-analise', JSON.stringify(result));
      localStorage.setItem('fonte-dados', 'firestore');
      
      toast({
        title: "Dados carregados",
        description: `${result.analise.deputadosAnalise.length} deputados encontrados`,
      });
      
    } catch (err: any) {
      console.error('Erro ao buscar dados do Firestore:', err);
      setError(err.message || 'Erro ao carregar dados');
      
      // Tentar carregar do localStorage como fallback
      const cached = localStorage.getItem('ultima-analise');
      if (cached) {
        const cachedData = JSON.parse(cached);
        setData(cachedData);
        
        toast({
          title: "Usando dados em cache",
          description: "Não foi possível conectar ao Firestore. Usando última análise salva.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: err.message || "Não foi possível carregar os dados",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [options?.ano, options?.mes, options?.uf, options?.partido, toast]);

  // Auto-carregar dados se configurado
  useEffect(() => {
    if (options?.autoLoad !== false) {
      fetchData();
    }
  }, [options?.autoLoad, fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    isFromCache: data && localStorage.getItem('fonte-dados') !== 'firestore'
  };
}

// Hook para buscar deputados específicos
export function useDeputadoFirestore(deputadoId?: string) {
  const [deputado, setDeputado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deputadoId) return;

    const fetchDeputado = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const deputados = await firestoreService.buscarDeputados({ limite: 1 });
        const deputadoEncontrado = deputados.find(d => d.id === deputadoId);
        
        if (deputadoEncontrado) {
          // Buscar despesas do deputado
          const ano = new Date().getFullYear();
          const despesas = await firestoreService.buscarDespesasDeputado(
            deputadoId,
            ano,
            'todos'
          );
          
          setDeputado({
            ...deputadoEncontrado,
            despesas
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeputado();
  }, [deputadoId]);

  return { deputado, loading, error };
}

// Hook para buscar ranking
export function useRankingFirestore(options?: {
  ano?: number;
  mes?: number | string;
  tipoDespesa?: string;
  uf?: string;
}) {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await firestoreService.buscarRankingDespesas({
          ano: options?.ano || new Date().getFullYear(),
          mes: options?.mes || 'todos',
          tipoDespesa: options?.tipoDespesa,
          uf: options?.uf
        });
        
        setRanking(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [options?.ano, options?.mes, options?.tipoDespesa, options?.uf]);

  return { ranking, loading, error };
}
