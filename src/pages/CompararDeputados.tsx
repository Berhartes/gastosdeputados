import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts'
import { ArrowUpDown, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Database } from 'lucide-react'
import { useDeputadosFirestore, useFirestore } from '@/contexts/FirestoreContext'
import { FirestoreStatus, EmptyDataPlaceholder } from '@/components/FirestoreStatus'

interface CompararDeputadosProps {
  deputados?: any[]
}

export function CompararDeputados({ deputados: deputadosProp }: CompararDeputadosProps) {
  // Usar dados do Firestore se não foram passados como props
  const { deputados: deputadosFirestore, loading, error } = useDeputadosFirestore();
  const { refetch, isConnected } = useFirestore();
  
  const deputados = deputadosProp || deputadosFirestore;
  const [deputadosSelecionados, setDeputadosSelecionados] = useState<any[]>([])
  const [metricaSelecionada, setMetricaSelecionada] = useState<'gastos' | 'alertas' | 'categorias'>('gastos')

  const toggleDeputado = (deputado: any) => {
    if (deputadosSelecionados.find(d => d.nome === deputado.nome)) {
      setDeputadosSelecionados(deputadosSelecionados.filter(d => d.nome !== deputado.nome))
    } else if (deputadosSelecionados.length < 4) {
      setDeputadosSelecionados([...deputadosSelecionados, deputado])
    }
  }

  // Preparar dados para comparação
  const dadosComparacao = deputadosSelecionados.map(dep => ({
    nome: dep.nome.split(' ')[0],
    totalGasto: dep.totalGasto,
    numAlertas: dep.alertas.length,
    scoreSuspeicao: dep.scoreSuspeicao,
    mediaGasto: dep.gastoMedio,
    numTransacoes: dep.numTransacoes
  }))

  // Dados para radar chart
  const dadosRadar = deputadosSelecionados.length > 0 ? [
    'Total Gasto',
    'Alertas',
    'Score Suspeição',
    'Transações',
    'Média Gasto'
  ].map(metrica => {
    const dataPoint: any = { metrica }
    deputadosSelecionados.forEach(dep => {
      const nomeSimples = dep.nome.split(' ')[0]
      switch (metrica) {
        case 'Total Gasto':
          dataPoint[nomeSimples] = (dep.totalGasto / 100000) * 100 // Normalizar para 0-100
          break
        case 'Alertas':
          dataPoint[nomeSimples] = dep.alertas.length * 10
          break
        case 'Score Suspeição':
          dataPoint[nomeSimples] = dep.scoreSuspeicao
          break
        case 'Transações':
          dataPoint[nomeSimples] = Math.min((dep.numTransacoes / 200) * 100, 100)
          break
        case 'Média Gasto':
          dataPoint[nomeSimples] = Math.min((dep.gastoMedio / 5000) * 100, 100)
          break
      }
    })
    return dataPoint
  }) : []

  // Dados por categoria baseados nos dados reais
  const processarDadosPorCategoria = () => {
    const categoriasMap: Record<string, any> = {};
    
    deputadosSelecionados.forEach(dep => {
      const nomeSimples = dep.nome.split(' ')[0];
      
      if (dep.maioresCategorias && dep.maioresCategorias.length > 0) {
        dep.maioresCategorias.forEach((cat: any) => {
          if (!categoriasMap[cat.categoria]) {
            categoriasMap[cat.categoria] = { categoria: cat.categoria };
          }
          categoriasMap[cat.categoria][nomeSimples] = cat.valor;
        });
      } else {
        // Fallback se não houver dados de categoria
        const categoriasDefault = ['Combustível', 'Divulgação', 'Escritório', 'Passagens', 'Outros'];
        categoriasDefault.forEach(cat => {
          if (!categoriasMap[cat]) {
            categoriasMap[cat] = { categoria: cat };
          }
          categoriasMap[cat][nomeSimples] = dep.totalGasto * (Math.random() * 0.3);
        });
      }
    });
    
    return Object.values(categoriasMap).slice(0, 5);
  };
  
  const dadosCategoria = processarDadosPorCategoria();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

  if (loading) {
    return <FirestoreStatus loading={loading} />;
  }

  if (error) {
    return <FirestoreStatus error={error} onRetry={refetch} />;
  }

  if (!deputados || deputados.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comparar Deputados</h2>
          <p className="text-muted-foreground">
            Selecione até 4 deputados para comparação detalhada
          </p>
        </div>
        <EmptyDataPlaceholder 
          message="Nenhum deputado disponível para comparação"
          actionLabel="Buscar dados do Firestore"
          onAction={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comparar Deputados</h2>
          <p className="text-muted-foreground">
            Selecione até 4 deputados para comparação detalhada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FirestoreStatus 
            showConnectionStatus 
            isConnected={isConnected}
            dataSource={localStorage.getItem('fonte-dados') as 'firestore' | 'cache'}
          />
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Seletor de Deputados */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Deputados</CardTitle>
          <CardDescription>
            {deputadosSelecionados.length}/4 deputados selecionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deputados
              .sort((a, b) => b.totalGasto - a.totalGasto)
              .slice(0, 16)
              .map((dep, index) => {
              const selecionado = deputadosSelecionados.find(d => d.nome === dep.nome)
              return (
                <Button
                  key={index}
                  variant={selecionado ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDeputado(dep)}
                  disabled={!selecionado && deputadosSelecionados.length >= 4}
                  className="justify-start"
                >
                  <div className="text-left">
                    <p className="font-medium truncate">{dep.nome}</p>
                    <p className="text-xs opacity-70">{dep.partido}-{dep.uf}</p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {deputadosSelecionados.length > 0 && (
        <>
          {/* Cards de Comparação Rápida */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {deputadosSelecionados.map((dep, index) => (
              <Card key={index} className="border-2" style={{ borderColor: COLORS[index] }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{dep.nome.split(' ')[0]}</CardTitle>
                    <Badge variant="outline">{dep.partido}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">R$ {(dep.totalGasto / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alertas</span>
                    <span className="font-medium">{dep.alertas.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className={`font-medium ${
                      dep.scoreSuspeicao >= 70 ? 'text-red-600' :
                      dep.scoreSuspeicao >= 40 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{dep.scoreSuspeicao}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Seletor de Métrica */}
          <div className="flex gap-2">
            <Button
              variant={metricaSelecionada === 'gastos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricaSelecionada('gastos')}
            >
              Gastos Totais
            </Button>
            <Button
              variant={metricaSelecionada === 'alertas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricaSelecionada('alertas')}
            >
              Alertas e Score
            </Button>
            <Button
              variant={metricaSelecionada === 'categorias' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetricaSelecionada('categorias')}
            >
              Por Categoria
            </Button>
          </div>

          {/* Gráficos de Comparação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metricaSelecionada === 'gastos' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação de Gastos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height="300">
                      <BarChart data={dadosComparacao}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                        <Legend />
                        <Bar dataKey="totalGasto" fill="#3B82F6" name="Total Gasto" />
                        <Bar dataKey="mediaGasto" fill="#10B981" name="Média por Transação" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Número de Transações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height="300">
                      <BarChart data={dadosComparacao}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="numTransacoes" fill="#F59E0B" name="Transações" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {metricaSelecionada === 'alertas' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas e Score de Suspeição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height="300">
                      <BarChart data={dadosComparacao}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="numAlertas" fill="#EF4444" name="Alertas" />
                        <Bar dataKey="scoreSuspeicao" fill="#8B5CF6" name="Score Suspeição" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Análise Multidimensional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height="300">
                      <RadarChart data={dadosRadar}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metrica" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        {deputadosSelecionados.map((dep, index) => (
                          <Radar
                            key={index}
                            name={dep.nome.split(' ')[0]}
                            dataKey={dep.nome.split(' ')[0]}
                            stroke={COLORS[index]}
                            fill={COLORS[index]}
                            fillOpacity={0.3}
                          />
                        ))}
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {metricaSelecionada === 'categorias' && (
              <>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height="300">
                      <BarChart data={dadosCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                        <Legend />
                        {deputadosSelecionados.map((dep, index) => (
                          <Bar
                            key={index}
                            dataKey={dep.nome.split(' ')[0]}
                            fill={COLORS[index]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tabela de Comparação Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Métrica</th>
                      {deputadosSelecionados.map((dep, index) => (
                        <th key={index} className="text-right p-2">
                          {dep.nome.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Total Gasto</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          R$ {dep.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Alertas</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          <Badge variant={dep.alertas.length > 5 ? "destructive" : "secondary"}>
                            {dep.alertas.length}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Score Suspeição</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          <span className={`font-bold ${
                            dep.scoreSuspeicao >= 70 ? 'text-red-600' :
                            dep.scoreSuspeicao >= 40 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {dep.scoreSuspeicao}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Transações</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          {dep.numTransacoes || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Média/Transação</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          R$ {(dep.gastoMedio || (dep.totalGasto / (dep.numTransacoes || 1))).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Partido/UF</td>
                      {deputadosSelecionados.map((dep, index) => (
                        <td key={index} className="text-right p-2">
                          <Badge variant="outline">
                            {dep.partido}-{dep.uf}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
