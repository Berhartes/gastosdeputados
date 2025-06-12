import React, { useState, useEffect } from 'react'
import { Brain, FileSpreadsheet, TrendingUp, Users, AlertTriangle, Eye, Download, BarChart3, HardDrive } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProcessadorDadosCamara } from '@/components/ProcessadorDadosCamara'
import { ApiDataFetcher } from '@/components/api/ApiDataFetcher'
import { ProcessadorArquivosGrandes } from '@/components/ProcessadorArquivosGrandes'
import { 
  type DeputadoProcessado, 
  type FornecedorSuspeito,
  detectarPadroesEspecificos 
} from '@/services/processador-dados-camara'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts'

interface AnaliseAvancadaPageProps {
  onSelectDeputado?: (deputado: any) => void
}

export function AnaliseAvancadaPage({ onSelectDeputado }: AnaliseAvancadaPageProps) {
  const [dadosAnalise, setDadosAnalise] = useState<{
    deputados: DeputadoProcessado[]
    fornecedores: FornecedorSuspeito[]
    estatisticas: any
  } | null>(null)
  const [padroeDetectados, setPadroesDetectados] = useState<any>(null)

  useEffect(() => {
    // Tentar carregar dados salvos
    const dadosSalvos = localStorage.getItem('dadosAnaliseCamara')
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos)
        setDadosAnalise(dados)
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error)
      }
    }
  }, [])

  const handleAnalysisComplete = (dados: {
    deputados: DeputadoProcessado[]
    fornecedores: FornecedorSuspeito[]
    estatisticas: any
  }) => {
    setDadosAnalise(dados)
  }

  // Preparar dados para gráficos
  const dadosGraficoPartidos = dadosAnalise ? 
    Object.entries(
      dadosAnalise.deputados.reduce((acc, dep) => {
        acc[dep.partido] = (acc[dep.partido] || 0) + dep.totalGasto
        return acc
      }, {} as Record<string, number>)
    ).map(([partido, gasto]) => ({ partido, gasto }))
    .sort((a, b) => b.gasto - a.gasto)
    .slice(0, 10) : []

  const dadosGraficoUFs = dadosAnalise ?
    Object.entries(
      dadosAnalise.deputados.reduce((acc, dep) => {
        acc[dep.uf] = (acc[dep.uf] || 0) + dep.totalGasto
        return acc
      }, {} as Record<string, number>)
    ).map(([uf, gasto]) => ({ uf, gasto }))
    .sort((a, b) => b.gasto - a.gasto)
    .slice(0, 15) : []

  const dadosScoreSuspeicao = dadosAnalise ?
    dadosAnalise.deputados.map(dep => ({
      nome: dep.nome.split(' ')[0], // Primeiro nome
      score: dep.scoreSuspeicao,
      gasto: dep.totalGasto,
      alertas: dep.alertas.length
    })) : []

  const coresGraficos = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
    '#d084d0', '#87ceeb', '#ffa500', '#ff6347', '#9370db'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Análise Avançada - Dados da Câmara
          </h1>
          <p className="text-muted-foreground mt-1">
            Processamento e análise inteligente de dados oficiais da Câmara dos Deputados
          </p>
        </div>
      </div>

      {!dadosAnalise ? (
        /* Opções de entrada de dados */
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload de Arquivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload de Arquivo CSV
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos CSV da Câmara para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProcessadorDadosCamara onAnalysisComplete={handleAnalysisComplete} />
              </CardContent>
            </Card>

            {/* Buscar da API */}
            <ApiDataFetcher onDataFetched={(data) => {
              // Converter o formato da análise para o esperado
              const dadosConvertidos = {
                deputados: data.analise.deputadosAnalise.map((dep: any) => ({
                  nome: dep.nome,
                  partido: dep.partido,
                  uf: dep.uf,
                  totalGasto: dep.totalGasto,
                  numTransacoes: dep.numTransacoes,
                  scoreSuspeicao: dep.scoreSuspeicao,
                  alertas: dep.alertas,
                  gastos: dep.gastos
                })),
                fornecedores: data.analise.fornecedoresSuspeitos.map((forn: any) => ({
                  nome: forn.nome,
                  cnpj: forn.cnpj,
                  totalTransacionado: forn.totalRecebido,
                  deputadosAtendidos: forn.deputadosNomes || [],
                  scoreSuspeicao: forn.indiceSuspeicao,
                  alertas: forn.razoesSuspeita || []
                })),
                estatisticas: {
                  totalGastos: data.analise.estatisticas.totalGasto,
                  totalDeputados: data.analise.estatisticas.numDeputados,
                  alertasEncontrados: data.analise.alertas.length
                }
              }
              setDadosAnalise(dadosConvertidos)
            }} />
          </div>

          {/* Processador de Arquivos Grandes */}
          <ProcessadorArquivosGrandes 
            onProcessComplete={(resultado) => {
              // Dados já vêm no formato correto do processador
              setDadosAnalise(resultado)
              // Salvar no localStorage
              localStorage.setItem('dadosAnaliseCamara', JSON.stringify(resultado))
            }}
          />
        </div>
      ) : (
        /* Análise Completa */
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="deputados" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Deputados
            </TabsTrigger>
            <TabsTrigger value="fornecedores" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="padroes" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Padrões
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Gastos</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {(dadosAnalise.estatisticas.totalGastos / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Deputados</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dadosAnalise.estatisticas.totalDeputados}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alertas</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {dadosAnalise.estatisticas.alertasEncontrados}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fornec. Suspeitos</p>
                      <p className="text-2xl font-bold text-red-600">
                        {dadosAnalise.fornecedores.length}
                      </p>
                    </div>
                    <FileSpreadsheet className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gastos por Partido */}
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Partido</CardTitle>
                  <CardDescription>Top 10 partidos com maiores gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosGraficoPartidos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="partido" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']} />
                      <Bar dataKey="gasto" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gastos por UF */}
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Estado</CardTitle>
                  <CardDescription>Distribuição geográfica dos gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosGraficoUFs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="uf" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']} />
                      <Bar dataKey="gasto" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Score de Suspeição */}
            <Card>
              <CardHeader>
                <CardTitle>Relação Score de Suspeição vs Gastos</CardTitle>
                <CardDescription>Análise de correlação entre gastos e suspeição</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={dadosScoreSuspeicao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="gasto" 
                      type="number" 
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      name="Gasto Total"
                    />
                    <YAxis 
                      dataKey="score" 
                      type="number" 
                      domain={[0, 100]}
                      name="Score de Suspeição"
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'score') return [`${value}`, 'Score de Suspeição']
                        if (name === 'gasto') return [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto Total']
                        return [value, name]
                      }}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload
                        return data ? `${data.nome} (${data.alertas} alertas)` : label
                      }}
                    />
                    <Scatter dataKey="score" fill="#ff7300" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deputados */}
          <TabsContent value="deputados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deputados com Maior Score de Suspeição</CardTitle>
                <CardDescription>Lista completa ordenada por nível de suspeição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosAnalise.deputados.map((deputado, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-lg">{deputado.nome}</span>
                          <Badge variant="outline">{deputado.partido}/{deputado.uf}</Badge>
                          <Badge 
                            variant={
                              deputado.scoreSuspeicao > 70 ? 'destructive' : 
                              deputado.scoreSuspeicao > 40 ? 'secondary' : 'outline'
                            }
                          >
                            Score: {deputado.scoreSuspeicao}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {deputado.numTransacoes} transações • R$ {deputado.totalGasto.toLocaleString('pt-BR')} total
                          {deputado.alertas.length > 0 && (
                            <span className="text-orange-600 ml-2">
                              • {deputado.alertas.length} alerta(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectDeputado?.(deputado)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fornecedores Suspeitos</CardTitle>
                <CardDescription>Empresas com padrões suspeitos identificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosAnalise.fornecedores.map((fornecedor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-lg">{fornecedor.nome}</span>
                          <Badge 
                            variant={
                              fornecedor.scoreSuspeicao > 70 ? 'destructive' : 
                              fornecedor.scoreSuspeicao > 40 ? 'secondary' : 'outline'
                            }
                          >
                            Score: {fornecedor.scoreSuspeicao}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          CNPJ: {fornecedor.cnpj} • R$ {fornecedor.totalTransacionado.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Atende: {fornecedor.deputadosAtendidos.join(', ')}
                        </div>
                        {fornecedor.alertas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {fornecedor.alertas.map((alerta, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {alerta}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Padrões */}
          <TabsContent value="padroes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detecção de Padrões</CardTitle>
                  <CardDescription>Análise automática de comportamentos suspeitos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Superfaturamento de Combustível</span>
                      <Badge variant="destructive">
                        {dadosAnalise.deputados.filter(d => 
                          d.alertas.some(a => a.tipo === 'SUPERFATURAMENTO')
                        ).length} casos
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Gastos Acima do Limite</span>
                      <Badge variant="secondary">
                        {dadosAnalise.deputados.filter(d => 
                          d.alertas.some(a => a.tipo === 'LIMITE_EXCEDIDO')
                        ).length} casos
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Fornecedores Exclusivos</span>
                      <Badge variant="outline">
                        {dadosAnalise.fornecedores.filter(f => 
                          f.deputadosAtendidos.length <= 2
                        ).length} fornecedores
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Recomendadas</CardTitle>
                  <CardDescription>Próximos passos baseados na análise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">1. Investigação Prioritária</p>
                      <p className="text-xs text-muted-foreground">
                        Focar nos {dadosAnalise!.deputados.filter(d => d.scoreSuspeicao > 70).length} deputados com score {'>'} 70
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">2. Auditoria de Fornecedores</p>
                      <p className="text-xs text-muted-foreground">
                        Verificar os {dadosAnalise!.fornecedores.length} fornecedores com padrões suspeitos
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">3. Monitoramento Contínuo</p>
                      <p className="text-xs text-muted-foreground">
                        Implementar alertas automáticos para novos padrões
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Botão para Reprocessar */}
      {dadosAnalise && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setDadosAnalise(null)
              localStorage.removeItem('dadosAnaliseCamara')
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Processar Novos Dados
          </Button>
        </div>
      )}
    </div>
  )
}
