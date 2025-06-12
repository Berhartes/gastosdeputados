import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Database, Trash2, Download, Upload, RefreshCw, AlertCircle } from 'lucide-react'
import { useApiCache } from '@/services/cache/api-cache'
import { toast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CacheConfigProps {
  onUpdate?: () => void
}

export function CacheConfig({ onUpdate }: CacheConfigProps) {
  const { getCacheStats, cleanupCache, clearCache } = useApiCache()
  const [stats, setStats] = useState<any>(null)
  const [autoCleanup, setAutoCleanup] = useState(
    localStorage.getItem('cache_auto_cleanup') === 'true'
  )
  const [cacheTTL, setCacheTTL] = useState(
    parseInt(localStorage.getItem('cache_ttl') || '24')
  )

  useEffect(() => {
    updateStats()
  }, [])

  const updateStats = () => {
    const cacheStats = getCacheStats()
    setStats(cacheStats)
  }

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar TODO o cache? Esta ação não pode ser desfeita.')) {
      clearCache()
      updateStats()
      toast({
        title: 'Cache limpo',
        description: 'Todo o cache foi removido com sucesso.'
      })
      onUpdate?.()
    }
  }

  const handleCleanup = () => {
    const removed = cleanupCache()
    updateStats()
    toast({
      title: 'Limpeza concluída',
      description: `${removed} entradas expiradas foram removidas.`
    })
    onUpdate?.()
  }

  const handleExport = () => {
    try {
      const { exportCache } = require('@/services/cache/api-cache').apiCache
      const data = exportCache()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cache-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Cache exportado',
        description: 'Backup do cache criado com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar o cache.',
        variant: 'destructive'
      })
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const { importCache } = require('@/services/cache/api-cache').apiCache
        const success = importCache(text)
        
        if (success) {
          updateStats()
          toast({
            title: 'Cache importado',
            description: 'Backup restaurado com sucesso.'
          })
          onUpdate?.()
        } else {
          throw new Error('Falha na importação')
        }
      } catch (error) {
        toast({
          title: 'Erro ao importar',
          description: 'Arquivo inválido ou corrompido.',
          variant: 'destructive'
        })
      }
    }
    input.click()
  }

  const handleAutoCleanupToggle = (checked: boolean) => {
    setAutoCleanup(checked)
    localStorage.setItem('cache_auto_cleanup', checked.toString())
    
    if (checked) {
      // Agendar limpeza automática
      const interval = setInterval(() => {
        cleanupCache()
      }, 24 * 60 * 60 * 1000) // 24 horas
      
      // Salvar o ID do intervalo para poder cancelar depois
      (window as any).cacheCleanupInterval = interval
    } else {
      // Cancelar limpeza automática
      if ((window as any).cacheCleanupInterval) {
        clearInterval((window as any).cacheCleanupInterval)
      }
    }
  }

  const handleTTLChange = (value: number[]) => {
    setCacheTTL(value[0])
    localStorage.setItem('cache_ttl', value[0].toString())
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const cacheUsagePercent = stats ? (stats.totalSize / (50 * 1024 * 1024)) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Cache
        </CardTitle>
        <CardDescription>
          Configure o armazenamento local de dados da API para melhor performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        {stats && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Uso do Cache</span>
                <span className="text-sm text-muted-foreground">
                  {formatBytes(stats.totalSize)} / 50 MB
                </span>
              </div>
              <Progress value={cacheUsagePercent} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Entradas armazenadas</p>
                <p className="font-medium">{stats.totalEntries}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dados mais antigos</p>
                <p className="font-medium">
                  {stats.oldestEntry 
                    ? new Date(stats.oldestEntry).toLocaleDateString('pt-BR')
                    : 'Nenhum'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configurações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-cleanup">Limpeza automática</Label>
              <p className="text-xs text-muted-foreground">
                Remove dados expirados automaticamente
              </p>
            </div>
            <Switch
              id="auto-cleanup"
              checked={autoCleanup}
              onCheckedChange={handleAutoCleanupToggle}
            />
          </div>

          <div className="space-y-2">
            <Label>Tempo de vida do cache (horas)</Label>
            <Slider
              value={[cacheTTL]}
              onValueChange={handleTTLChange}
              min={1}
              max={168}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground text-right">
              {cacheTTL} {cacheTTL === 1 ? 'hora' : 'horas'}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar Expirados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="w-full text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Tudo
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar Cache
            </Button>
          </div>
        </div>

        {/* Aviso */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            O cache acelera significativamente as buscas repetidas. Dados são 
            armazenados localmente e nunca são enviados para servidores externos.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
