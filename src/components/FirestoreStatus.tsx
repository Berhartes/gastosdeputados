import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, WifiOff, Database } from 'lucide-react';

interface FirestoreStatusProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showConnectionStatus?: boolean;
  isConnected?: boolean;
  dataSource?: 'firestore' | 'cache';
}

export function FirestoreStatus({ 
  loading, 
  error, 
  onRetry,
  showConnectionStatus = false,
  isConnected = true,
  dataSource
}: FirestoreStatusProps) {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Carregando dados do Firestore...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{error}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (showConnectionStatus) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isConnected ? (
          <>
            <Database className="h-4 w-4 text-green-600" />
            <span>Conectado ao Firestore</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span>Modo offline - Usando dados em cache</span>
          </>
        )}
        {dataSource === 'cache' && (
          <span className="text-orange-600">(Dados salvos localmente)</span>
        )}
      </div>
    );
  }

  return null;
}

// Componente de placeholder para quando não há dados
export function EmptyDataPlaceholder({ 
  message = "Nenhum dado encontrado",
  actionLabel = "Buscar dados",
  onAction
}: {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Database className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Conecte-se ao Firestore para visualizar os dados mais recentes
      </p>
      {onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Indicador de sincronização
export function SyncIndicator({ 
  lastSync,
  onSync
}: {
  lastSync?: Date | string;
  onSync?: () => void;
}) {
  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    
    const date = typeof lastSync === 'string' ? new Date(lastSync) : lastSync;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} minutos`;
    if (minutes < 1440) return `Há ${Math.floor(minutes / 60)} horas`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        Última sincronização: {formatLastSync()}
      </span>
      {onSync && (
        <Button
          onClick={onSync}
          variant="ghost"
          size="sm"
          className="h-7"
        >
          <Loader2 className="h-3 w-3 mr-1" />
          Sincronizar
        </Button>
      )}
    </div>
  );
}
