import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Filter, Download, Eye, RefreshCw } from 'lucide-react'
import { AlertaSuspeito } from '@/types/gastos'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFirestore, useAlertasFirestore } from '@/contexts/FirestoreContext'
import { FirestoreStatus, EmptyDataPlaceholder } from '@/components/FirestoreStatus'

interface AlertasPageProps {
  onViewProfile?: () => void
}

export function AlertasPage({ onViewProfile }: AlertasPageProps) {
  // Usar dados do Firestore via Context
  const { alertas, loading, error } = useAlertasFirestore();
  const { data: firestoreData, refetch, isConnected } = useFirestore();
  
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [filtroGravidade, setFiltroGravidade] = useState<string>('TODOS')
  const [alertasFiltrados, setAlertasFiltrados] = useState<AlertaSuspeito[]>([])

  // Atualizar alertas quando dados mudarem
  useEffect(() => {
    setAlertasFiltrados(alertas)
  }, [alertas])

  useEffect(() => {
    let filtrados = [...alertas]

    if (filtroTipo !== 'TODOS') {
      filtrados = filtrados.filter((a: AlertaSuspeito) => a.tipo === filtroTipo)
    }

    if (filtroGravidade !== 'TODOS') {
      filtrados = filtrados.filter((a: AlertaSuspeito) => a.gravidade === filtroGravidade)
    }

    setAlertasFiltrados(filtrados)
  }, [filtroTipo, filtroGravidade, alertas])

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case 'ALTA':
        return 'destructive'
      case 'MEDIA':
        return 'warning'
      case 'BAIXA':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'SUPERFATURAMENTO': 'Superfaturamento',
      'LIMITE_EXCEDIDO': 'Limite Excedido',
      'FORNECEDOR_SUSPEITO': 'Fornecedor Suspeito',
      'CONCENTRACAO_TEMPORAL': 'Concentração Temporal',
      'VALOR_REPETIDO': 'Valor Repetido'
    }
    return labels[tipo] || tipo
  }

  const exportarAlertas = () => {
    const csv = [
      ['Tipo', 'Gravidade', 'Deputado', 'Descrição', 'Valor', 'Detalhes'].join(','),
      ...alertasFiltrados.map(a => [
        a.tipo,
        a.gravidade,
        a.deputado,
        `"${a.descricao}"`,
        a.valor.toFixed(2),
        `"${JSON.stringify(a.detalhes)}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `alertas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alertas Detectados</h2>
          <p className="text-muted-foreground">
            {alertasFiltrados.length} alertas encontrados na análise
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
          <Button onClick={exportarAlertas} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>
      
      <FirestoreStatus loading={loading} error={error} onRetry={refetch} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Tipo de Alerta</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os tipos</SelectItem>
                  <SelectItem value="SUPERFATURAMENTO">Superfaturamento</SelectItem>
                  <SelectItem value="LIMITE_EXCEDIDO">Limite Excedido</SelectItem>
                  <SelectItem value="FORNECEDOR_SUSPEITO">Fornecedor Suspeito</SelectItem>
                  <SelectItem value="CONCENTRACAO_TEMPORAL">Concentração Temporal</SelectItem>
                  <SelectItem value="VALOR_REPETIDO">Valor Repetido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Gravidade</label>
              <Select value={filtroGravidade} onValueChange={setFiltroGravidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      {alertasFiltrados.length === 0 && !loading ? (
        <EmptyDataPlaceholder 
          message="Nenhum alerta encontrado"
          actionLabel="Buscar dados do Firestore"
          onAction={refetch}
        />
      ) : (
        <div className="space-y-4">
          {alertasFiltrados.map((alerta: AlertaSuspeito, index: number) => (
          <Card key={alerta.id || index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {alerta.gravidade === 'ALTA' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <CardTitle className="text-lg">{getTipoLabel(alerta.tipo)}</CardTitle>
                    <Badge variant={getGravidadeColor(alerta.gravidade)}>
                      {alerta.gravidade}
                    </Badge>
                  </div>
                  <CardDescription>
                    {alerta.deputado !== 'MÚLTIPLOS' && `Deputado: ${alerta.deputado}`}
                  </CardDescription>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      R$ {alerta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {alerta.deputado !== 'MÚLTIPLOS' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={onViewProfile}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{alerta.descricao}</p>
              
              {/* Detalhes específicos por tipo */}
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                {alerta.tipo === 'SUPERFATURAMENTO' && alerta.detalhes && (
                  <>
                    <p><strong>Fornecedor:</strong> {alerta.detalhes.fornecedor}</p>
                    <p><strong>CNPJ:</strong> {alerta.detalhes.cnpj}</p>
                    <p><strong>Data:</strong> {new Date(alerta.detalhes.data).toLocaleDateString('pt-BR')}</p>
                    {alerta.detalhes.percentualAcima && (
                      <p><strong>Acima do normal:</strong> {alerta.detalhes.percentualAcima}%</p>
                    )}
                  </>
                )}

                {alerta.tipo === 'LIMITE_EXCEDIDO' && alerta.detalhes && (
                  <>
                    <p><strong>Período:</strong> {alerta.detalhes.mes}/{alerta.detalhes.ano}</p>
                    <p><strong>Limite:</strong> R$ {alerta.detalhes.limite?.toLocaleString('pt-BR')}</p>
                    <p><strong>Excedido em:</strong> {alerta.detalhes.percentualExcedido}%</p>
                    <p><strong>Transações:</strong> {alerta.detalhes.numTransacoes}</p>
                  </>
                )}

                {alerta.tipo === 'FORNECEDOR_SUSPEITO' && alerta.detalhes && (
                  <>
                    <p><strong>Fornecedor:</strong> {alerta.detalhes.fornecedor}</p>
                    <p><strong>CNPJ:</strong> {alerta.detalhes.cnpj}</p>
                    <p><strong>Deputados atendidos:</strong> {alerta.detalhes.deputadosAtendidos?.length || 0}</p>
                    <p><strong>Média por transação:</strong> R$ {alerta.detalhes.mediaTransacao?.toLocaleString('pt-BR')}</p>
                    {alerta.detalhes.deputadosAtendidos && (
                      <div className="mt-2">
                        <p><strong>Deputados:</strong></p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {alerta.detalhes.deputadosAtendidos.map((dep: string, i: number) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              onClick={onViewProfile}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {dep}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {alerta.tipo === 'CONCENTRACAO_TEMPORAL' && alerta.detalhes && (
                  <>
                    <p><strong>Data:</strong> {new Date(alerta.detalhes.data).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Transações:</strong> {alerta.detalhes.numTransacoes}</p>
                    <p><strong>Fornecedores:</strong> {alerta.detalhes.fornecedores?.join(', ')}</p>
                  </>
                )}

                {alerta.tipo === 'VALOR_REPETIDO' && alerta.detalhes && (
                  <>
                    <p><strong>Ocorrências:</strong> {alerta.detalhes.ocorrencias}</p>
                    <p><strong>Deputados envolvidos:</strong> {alerta.detalhes.deputados}</p>
                    <p><strong>Fornecedores:</strong> {alerta.detalhes.fornecedores}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {alertasFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum alerta encontrado com os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
