import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  FileUp, HardDrive, Zap, AlertTriangle, 
  CheckCircle2, XCircle, Loader2, Info,
  TrendingUp, Clock, Database
} from 'lucide-react'
import { useProcessadorGrande } from '@/services/processador-arquivos-grandes'
import { toast } from '@/hooks/use-toast'
import { formatBytes, formatTime } from '@/lib/utils'

interface ProcessadorArquivosGrandesProps {
  onProcessComplete?: (resultado: any) => void
}

export function ProcessadorArquivosGrandes({ onProcessComplete }: ProcessadorArquivosGrandesProps) {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [chunks, setChunks] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { processar, cancelar } = useProcessadorGrande()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validar tipo de arquivo
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV.',
        variant: 'destructive'
      })
      return
    }

    // Verificar tamanho
    const sizeMB = selectedFile.size / (1024 * 1024)
    if (sizeMB > 200) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O limite máximo é 200MB. Considere dividir o arquivo.',
        variant: 'destructive'
      })
      return
    }

    setFile(selectedFile)
    setProgress(0)
    setStatus('')
    setStats(null)
  }

  const handleProcess = async () => {
    if (!file) return

    setProcessing(true)
    setProgress(0)
    setStatus('Iniciando processamento...')
    const startTime = Date.now()

    try {
      const resultado = await processar(file, {
        chunkSize: 5000,
        maxMemory: 100,
        useWebWorker: true,
        onProgress: (prog, stat) => {
          setProgress(prog)
          setStatus(stat)
        },
        onChunkProcessed: (current, total) => {
          setChunks({ current, total })
        }
      })

      const endTime = Date.now()
      const tempoTotal = endTime - startTime

      // Estatísticas finais
      setStats({
        tempoTotal,
        velocidade: resultado.estatisticas.velocidadeProcessamento,
        registros: resultado.estatisticas.totalRegistros,
        deputados: resultado.estatisticas.totalDeputados,
        alertas: resultado.estatisticas.alertasEncontrados
      })

      toast({
        title: 'Processamento concluído!',
        description: `${resultado.estatisticas.totalRegistros} registros processados com sucesso.`
      })

      // Callback com resultado
      if (onProcessComplete) {
        onProcessComplete(resultado)
      }

      // Salvar no localStorage
      const analiseCompleta = {
        data: new Date().toISOString(),
        arquivo: file.name,
        fonte: 'upload-grande',
        tamanhoArquivo: file.size,
        ...resultado
      }

      localStorage.setItem('ultima-analise', JSON.stringify(analiseCompleta))

      // Recarregar após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Erro no processamento:', error)
      toast({
        title: 'Erro no processamento',
        description: 'Ocorreu um erro ao processar o arquivo. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    cancelar()
    setProcessing(false)
    setProgress(0)
    setStatus('Processamento cancelado')
    toast({
      title: 'Processamento cancelado',
      description: 'O processamento foi interrompido pelo usuário.'
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Processador de Arquivos Grandes
            </CardTitle>
            <CardDescription>
              Otimizado para arquivos CSV de até 100MB com processamento em chunks
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Performance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de Upload */}
        <div className="border-2 border-dashed rounded-lg p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={processing}
          />
          
          {!file ? (
            <div className="text-center">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                size="lg"
              >
                Selecionar Arquivo CSV Grande
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Arquivos até 100MB • Processamento otimizado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(file.size)} • {new Date(file.lastModified).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {!processing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setStats(null)
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Aviso para arquivos grandes */}
              {file.size > 50 * 1024 * 1024 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Arquivo grande detectado!</strong> O processamento pode levar alguns minutos.
                    Mantenha esta aba aberta durante o processo.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Progresso de Processamento */}
        {processing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {status}
            </div>

            {chunks.total > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Chunk {chunks.current} de {chunks.total}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Processamento em lotes para otimizar memória
                </span>
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              className="w-full"
            >
              Cancelar Processamento
            </Button>
          </div>
        )}

        {/* Estatísticas após processamento */}
        {stats && !processing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Processamento concluído com sucesso!</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Tempo Total
                </div>
                <p className="font-medium">{formatTime(stats.tempoTotal)}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Velocidade
                </div>
                <p className="font-medium">{stats.velocidade.toFixed(0)} reg/s</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Database className="h-3 w-3" />
                  Registros
                </div>
                <p className="font-medium">{stats.registros.toLocaleString('pt-BR')}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  Alertas
                </div>
                <p className="font-medium">{stats.alertas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {file && !processing && !stats && (
          <Button
            onClick={handleProcess}
            size="lg"
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Processar Arquivo
          </Button>
        )}

        {/* Dicas */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dicas para arquivos grandes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>O processamento é feito em chunks para otimizar memória</li>
              <li>Arquivos de 100MB levam aproximadamente 2-5 minutos</li>
              <li>Mantenha a aba aberta durante o processamento</li>
              <li>Use Chrome ou Firefox para melhor performance</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Funções auxiliares para formatação
