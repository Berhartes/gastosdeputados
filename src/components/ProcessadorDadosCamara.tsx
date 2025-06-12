import React, { useState, useRef } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  processarDadosCamara, 
  gerarRelatorioAnalise,
  type DeputadoProcessado,
  type FornecedorSuspeito 
} from '@/services/processador-dados-camara'

interface ProcessadorDadosProps {
  onAnalysisComplete?: (dados: {
    deputados: DeputadoProcessado[]
    fornecedores: FornecedorSuspeito[]
    estatisticas: any
  }) => void
}

export function ProcessadorDadosCamara({ onAnalysisComplete }: ProcessadorDadosProps) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState<{
    deputados: DeputadoProcessado[]
    fornecedores: FornecedorSuspeito[]
    estatisticas: any
    relatorio?: string
  } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setArquivo(file)
        setErro(null)
        setResultado(null)
      } else {
        setErro('Por favor, selecione um arquivo CSV válido.')
      }
    }
  }

  const processarArquivo = async () => {
    if (!arquivo) return

    setProcessando(true)
    setProgresso(0)
    setErro(null)

    try {
      // Simular progresso
      const intervalos = [10, 30, 50, 70, 85, 95, 100]
      for (let i = 0; i < intervalos.length; i++) {
        setProgresso(intervalos[i])
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Ler arquivo
      const texto = await arquivo.text()
      
      // Processar dados
      const dadosProcessados = await processarDadosCamara(texto)
      
      // Gerar relatório
      const relatorio = gerarRelatorioAnalise(
        dadosProcessados.deputados,
        dadosProcessados.fornecedores,
        dadosProcessados.estatisticas
      )

      const resultadoFinal = {
        ...dadosProcessados,
        relatorio
      }

      setResultado(resultadoFinal)
      
      // Notificar componente pai
      onAnalysisComplete?.(dadosProcessados)

      // Salvar no localStorage para persistência
      localStorage.setItem('dadosAnaliseCamara', JSON.stringify(resultadoFinal))

    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      setErro('Erro ao processar o arquivo. Verifique se é um CSV válido da Câmara dos Deputados.')
    } finally {
      setProcessando(false)
      setProgresso(0)
    }
  }

  const exportarRelatorio = () => {
    if (!resultado?.relatorio) return

    const blob = new Blob([resultado.relatorio], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-analise-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportarDadosJSON = () => {
    if (!resultado) return

    const dadosExport = {
      deputados: resultado.deputados,
      fornecedores: resultado.fornecedores,
      estatisticas: resultado.estatisticas,
      geradoEm: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dados-analise-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const carregarDadosExemplo = async (tipo: 'basico' | 'completo' = 'basico') => {
    try {
      setProcessando(true)
      setProgresso(0)

      // Carregar arquivo de exemplo
      const arquivo = tipo === 'completo' ? '/dados-exemplo-completo.csv' : '/dados-exemplo.csv'
      const response = await fetch(arquivo)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.statusText}`)
      }
      
      const texto = await response.text()
      
      // Simular progresso
      for (let i = 0; i <= 100; i += 20) {
        setProgresso(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const dadosProcessados = await processarDadosCamara(texto)
      const relatorio = gerarRelatorioAnalise(
        dadosProcessados.deputados,
        dadosProcessados.fornecedores,
        dadosProcessados.estatisticas
      )

      const resultadoFinal = {
        ...dadosProcessados,
        relatorio
      }

      setResultado(resultadoFinal)
      onAnalysisComplete?.(dadosProcessados)

    } catch (error) {
      console.error('Erro ao carregar dados de exemplo:', error)
      setErro('Erro ao carregar dados de exemplo. Verifique se o arquivo existe no servidor.')
    } finally {
      setProcessando(false)
      setProgresso(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload de Arquivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processador de Dados da Câmara dos Deputados
          </CardTitle>
          <CardDescription>
            Faça upload de arquivos CSV oficiais da API da Câmara dos Deputados para análise avançada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Área de Upload */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {arquivo ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Clique para selecionar um arquivo CSV</p>
                <p className="text-sm text-muted-foreground">
                  Formato esperado: dados oficiais da Câmara dos Deputados
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={processando}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
              
              <Button 
                onClick={() => carregarDadosExemplo('basico')}
                variant="secondary"
                disabled={processando}
              >
                <Eye className="h-4 w-4 mr-2" />
                Exemplo Básico
              </Button>
              
              <Button 
                onClick={() => carregarDadosExemplo('completo')}
                variant="secondary"
                disabled={processando}
              >
                <Eye className="h-4 w-4 mr-2" />
                Exemplo Completo
              </Button>
            </div>
          </div>

          {/* Progresso */}
          {processando && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando dados...</span>
                <span>{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>
          )}

          {/* Botão de Processar */}
          {arquivo && !processando && (
            <Button 
              onClick={processarArquivo}
              className="w-full"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Processar e Analisar Dados
            </Button>
          )}

          {/* Erro */}
          {erro && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Análise Concluída
            </CardTitle>
            <CardDescription>
              Dados processados com sucesso. Veja o resumo abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resultado.estatisticas.totalDeputados}
                </div>
                <div className="text-sm text-muted-foreground">Deputados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {(resultado.estatisticas.totalGastos / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">Total Gastos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {resultado.estatisticas.alertasEncontrados}
                </div>
                <div className="text-sm text-muted-foreground">Alertas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {resultado.fornecedores.length}
                </div>
                <div className="text-sm text-muted-foreground">Fornec. Suspeitos</div>
              </div>
            </div>

            {/* Top Alertas */}
            <div>
              <h4 className="font-semibold mb-2">Top 3 Deputados com Maior Score de Suspeição</h4>
              <div className="space-y-2">
                {resultado.deputados.slice(0, 3).map((dep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{dep.nome}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({dep.partido}/{dep.uf})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={dep.scoreSuspeicao > 70 ? 'destructive' : dep.scoreSuspeicao > 40 ? 'secondary' : 'outline'}>
                        Score: {dep.scoreSuspeicao}
                      </Badge>
                      <span className="text-sm font-medium">
                        R$ {dep.totalGasto.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={exportarRelatorio} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório (MD)
              </Button>
              <Button onClick={exportarDadosJSON} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados (JSON)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
