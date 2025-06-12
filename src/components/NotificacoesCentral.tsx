import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, X, AlertTriangle, Info, CheckCircle, 
  AlertCircle, TrendingUp, Eye 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notificacao {
  id: string
  tipo: 'info' | 'warning' | 'error' | 'success'
  titulo: string
  descricao?: string
  acao?: {
    label: string
    onClick: () => void
  }
  tempo: number
  lida: boolean
  prioridade: 'baixa' | 'media' | 'alta'
}

interface NotificacoesCentralProps {
  className?: string
}

const iconesPorTipo = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle
}

const coresPorTipo = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200', 
  error: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200'
}

const coresTexto = {
  info: 'text-blue-900',
  warning: 'text-yellow-900',
  error: 'text-red-900', 
  success: 'text-green-900'
}

export function NotificacoesCentral({ className }: NotificacoesCentralProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [abertas, setAbertas] = useState(false)

  // Simular notificações baseadas em dados da análise
  useEffect(() => {
    const verificarNovasNotificacoes = () => {
      const analiseStr = localStorage.getItem('ultima-analise')
      if (!analiseStr) return

      const { analise } = JSON.parse(analiseStr)
      const alertasAlta = analise.alertas.filter((a: any) => a.gravidade === 'ALTA')
      
      if (alertasAlta.length > 0 && !notificacoes.find(n => n.id === 'alertas-alta')) {
        adicionarNotificacao({
          id: 'alertas-alta',
          tipo: 'error',
          titulo: `${alertasAlta.length} alertas de alta gravidade`,
          descricao: 'Irregularidades críticas detectadas que requerem atenção imediata',
          acao: {
            label: 'Ver Alertas',
            onClick: () => {
              // Navegar para página de alertas
              console.log('Navegando para alertas')
            }
          },
          prioridade: 'alta'
        })
      }

      // Notificar sobre superfaturamento
      const superfaturamento = analise.alertas.filter((a: any) => a.tipo === 'SUPERFATURAMENTO')
      if (superfaturamento.length > 0 && !notificacoes.find(n => n.id === 'superfaturamento')) {
        adicionarNotificacao({
          id: 'superfaturamento',
          tipo: 'warning', 
          titulo: 'Superfaturamento detectado',
          descricao: `${superfaturamento.length} casos de possível superfaturamento encontrados`,
          acao: {
            label: 'Investigar',
            onClick: () => console.log('Investigando superfaturamento')
          },
          prioridade: 'alta'
        })
      }

      // Notificar conclusão da análise
      if (!notificacoes.find(n => n.id === 'analise-concluida')) {
        adicionarNotificacao({
          id: 'analise-concluida',
          tipo: 'success',
          titulo: 'Análise concluída',
          descricao: `${analise.estatisticas.numDeputados} deputados analisados com sucesso`,
          prioridade: 'media'
        })
      }
    }

    verificarNovasNotificacoes()
    
    // Verificar periodicamente por novas notificações
    const interval = setInterval(verificarNovasNotificacoes, 30000)
    return () => clearInterval(interval)
  }, [notificacoes])

  const adicionarNotificacao = useCallback((notificacao: Omit<Notificacao, 'tempo' | 'lida'>) => {
    const nova: Notificacao = {
      ...notificacao,
      tempo: Date.now(),
      lida: false
    }
    
    setNotificacoes(prev => [nova, ...prev])
    
    // Auto remover notificações de baixa prioridade após 10 segundos
    if (notificacao.prioridade === 'baixa') {
      setTimeout(() => {
        removerNotificacao(notificacao.id)
      }, 10000)
    }
  }, [])

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }, [])

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    )
  }, [])

  const limparTodas = useCallback(() => {
    setNotificacoes([])
  }, [])

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <div className={cn("relative", className)}>
      {/* Botão de notificações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAbertas(!abertas)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {naoLidas > 9 ? '9+' : naoLidas}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {abertas && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                {notificacoes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparTodas}
                    className="text-xs"
                  >
                    Limpar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAbertas(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notificacoes.map((notificacao) => {
                  const Icon = iconesPorTipo[notificacao.tipo]
                  
                  return (
                    <div
                      key={notificacao.id}
                      className={cn(
                        "p-4 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer",
                        coresPorTipo[notificacao.tipo],
                        !notificacao.lida && "bg-opacity-50"
                      )}
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-5 w-5 mt-0.5", coresTexto[notificacao.tipo])} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "font-medium text-sm",
                              coresTexto[notificacao.tipo],
                              !notificacao.lida && "font-semibold"
                            )}>
                              {notificacao.titulo}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              {notificacao.prioridade === 'alta' && (
                                <TrendingUp className="h-3 w-3 text-red-600" />
                              )}
                              {!notificacao.lida && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          {notificacao.descricao && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notificacao.descricao}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notificacao.tempo).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {notificacao.acao && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  notificacao.acao!.onClick()
                                  marcarComoLida(notificacao.id)
                                }}
                                className="text-xs h-6"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {notificacao.acao.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook para usar as notificações
export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])

  const adicionarNotificacao = useCallback((notificacao: Omit<Notificacao, 'tempo' | 'lida'>) => {
    const nova: Notificacao = {
      ...notificacao,
      tempo: Date.now(),
      lida: false
    }
    
    setNotificacoes(prev => [nova, ...prev])
    return nova.id
  }, [])

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notificacoes,
    adicionarNotificacao,
    removerNotificacao
  }
}
