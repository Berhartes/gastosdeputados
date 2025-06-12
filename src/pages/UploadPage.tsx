import { useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, CheckCircle, Database } from 'lucide-react'
import { LoadingState } from '@/components/LoadingState'
import { useAnaliseGastos } from '@/hooks/use-analise-gastos'
import { FirestoreDataFetcher } from '@/components/firestore/FirestoreDataFetcher'

interface UploadPageProps {
  onAnalysisComplete: () => void
}

export function UploadPage({ onAnalysisComplete }: UploadPageProps) {
  const { estado, processarArquivo } = useAnaliseGastos()

  // Função para processar arquivos CSV reais enviados
  const processarArquivoEnviado = async (nomeArquivo: 'dadosexemplo.csv' | 'dadostestecompleto.csv' | 'Ano2025.csv') => {
    try {
      const response = await fetch(`/${nomeArquivo}`)
      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.statusText}`)
      }
      const blob = await response.blob()
      const file = new File([blob], nomeArquivo, { type: 'text/csv' })
      await processFile(file)
    } catch (error) {
      console.error('Erro ao processar arquivo enviado:', error)
    }
  }

  const processFile = useCallback(async (file: File) => {
    await processarArquivo(file)
    
    // Aguardar um pouco antes de redirecionar
    setTimeout(() => {
      onAnalysisComplete()
    }, 2500)
  }, [processarArquivo, onAnalysisComplete])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Se estiver processando, mostrar a tela de loading
  if (estado.carregando) {
    return (
      <LoadingState
        stage={estado.stage}
        progress={estado.progress}
        fileName={estado.fileName}
        totalRecords={estado.totalRecords}
        message={estado.message}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload de Dados</h2>
        <p className="text-muted-foreground">
          Faça upload do arquivo CSV com os gastos parlamentares para análise
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o arquivo CSV</CardTitle>
          <CardDescription>
            O arquivo deve estar no formato padrão da Câmara dos Deputados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arraste e solte o arquivo CSV aqui ou
            </p>
            <label className="mt-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={estado.carregando}
              />
              <Button variant="outline" className="mt-2" disabled={estado.carregando}>
                Selecionar arquivo
              </Button>
            </label>
          </div>

          {estado.erro && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">Erro no processamento</AlertTitle>
              <AlertDescription className="text-red-800">
                {estado.erro}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Formato esperado do arquivo</AlertTitle>
        <AlertDescription>
          O arquivo CSV deve conter as seguintes colunas: txNomeParlamentar, sgUF, sgPartido, 
          txtDescricao, txtFornecedor, txtCNPJCPF, vlrLiquido, datEmissao, etc.
          Use ponto-e-vírgula (;) como delimitador.
        </AlertDescription>
      </Alert>

      {/* Botões para processar arquivos enviados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processar Arquivos de Dados Reais
          </CardTitle>
          <CardDescription>
            Use os dados reais da Câmara dos Deputados que foram carregados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => processarArquivoEnviado('dadosexemplo.csv')}
              variant="secondary"
              disabled={estado.carregando}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Dados Exemplo (10 registros)
            </Button>
            
            <Button 
              onClick={() => processarArquivoEnviado('dadostestecompleto.csv')}
              variant="secondary"
              disabled={estado.carregando}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Dados Teste Completo (15 registros)
            </Button>
            
            <Button 
              onClick={() => processarArquivoEnviado('Ano2025.csv')}
              variant="default"
              disabled={estado.carregando}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Dados 2025 Completos
            </Button>
          </div>
          
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Dados Reais Disponíveis</AlertTitle>
            <AlertDescription>
              Estes são dados reais da API da Câmara dos Deputados. Clique em qualquer botão acima para processar e analisar os gastos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Buscar dados do Firestore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Buscar Dados do Firestore (Tempo Real)
          </CardTitle>
          <CardDescription>
            Conecte-se diretamente ao banco de dados oficial para obter dados atualizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirestoreDataFetcher 
            onDataFetched={() => {
              setTimeout(() => {
                onAnalysisComplete()
              }, 2000)
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
