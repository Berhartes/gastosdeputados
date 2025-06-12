import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, Download, Upload, Database, Bell, 
  Shield, Palette, Globe, Info 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CacheConfig } from '@/components/settings/CacheConfig'

export function ConfiguracoesPage() {
  const { toast } = useToast()
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: true,
    alertasAutomaticos: true,
    temaEscuro: false,
    idiomaPortugues: true,
    exportarComGraficos: true,
    salvarNuvem: false,
    analiseTempReal: false,
    limitesPersonalizados: false
  })

  const [limites, setLimites] = useState({
    limiteMensal: 45000,
    limiteCombustivel: 1000,
    limiteAbastecimento: 2000,
    minDeputadosFornecedor: 5
  })

  useEffect(() => {
    // Carregar configurações salvas
    const configSalvas = localStorage.getItem('configuracoes')
    if (configSalvas) {
      setConfiguracoes(JSON.parse(configSalvas))
    }
  }, [])

  const salvarConfiguracoes = () => {
    localStorage.setItem('configuracoes', JSON.stringify(configuracoes))
    localStorage.setItem('limites-analise', JSON.stringify(limites))
    
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    })
  }

  const exportarDados = () => {
    const dadosExportacao = {
      configuracoes,
      limites,
      analises: JSON.parse(localStorage.getItem('ultima-analise') || '{}'),
      dataExportacao: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gastos-deputados-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    toast({
      title: "Dados exportados",
      description: "Backup completo criado com sucesso.",
    })
  }

  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string)
        
        if (dados.configuracoes) {
          setConfiguracoes(dados.configuracoes)
          localStorage.setItem('configuracoes', JSON.stringify(dados.configuracoes))
        }
        
        if (dados.limites) {
          setLimites(dados.limites)
          localStorage.setItem('limites-analise', JSON.stringify(dados.limites))
        }

        if (dados.analises) {
          localStorage.setItem('ultima-analise', JSON.stringify(dados.analises))
        }

        toast({
          title: "Dados importados",
          description: "Backup restaurado com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const limparDados = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear()
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados foram removidos.",
        variant: "destructive"
      })

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Personalize o sistema de acordo com suas necessidades
        </p>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferências Gerais
              </CardTitle>
              <CardDescription>
                Configure as opções básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificacoes" className="text-base">
                    Notificações
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas sobre novas irregularidades
                  </p>
                </div>
                <Switch
                  id="notificacoes"
                  checked={configuracoes.notificacoes}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, notificacoes: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tema" className="text-base">
                    Tema Escuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar modo escuro para melhor visualização noturna
                  </p>
                </div>
                <Switch
                  id="tema"
                  checked={configuracoes.temaEscuro}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, temaEscuro: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="graficos" className="text-base">
                    Exportar com Gráficos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Incluir visualizações nos relatórios exportados
                  </p>
                </div>
                <Switch
                  id="graficos"
                  checked={configuracoes.exportarComGraficos}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, exportarComGraficos: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas e Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="alertas-auto" className="text-base">
                    Alertas Automáticos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Detectar padrões suspeitos automaticamente
                  </p>
                </div>
                <Switch
                  id="alertas-auto"
                  checked={configuracoes.alertasAutomaticos}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, alertasAutomaticos: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tempo-real" className="text-base">
                    Análise em Tempo Real
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Processar dados conforme são carregados
                  </p>
                </div>
                <Switch
                  id="tempo-real"
                  checked={configuracoes.analiseTempReal}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, analiseTempReal: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Análise */}
        <TabsContent value="analise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Limites de Detecção
              </CardTitle>
              <CardDescription>
                Configure os valores limites para detecção de irregularidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="limites-custom" className="text-base">
                    Limites Personalizados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usar valores customizados ao invés dos padrões
                  </p>
                </div>
                <Switch
                  id="limites-custom"
                  checked={configuracoes.limitesPersonalizados}
                  onCheckedChange={(checked) => 
                    setConfiguracoes({...configuracoes, limitesPersonalizados: checked})
                  }
                />
              </div>

              {configuracoes.limitesPersonalizados && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="limite-mensal">Limite Mensal (R$)</Label>
                      <input
                        id="limite-mensal"
                        type="number"
                        className="w-full px-3 py-1 border rounded"
                        value={limites.limiteMensal}
                        onChange={(e) => setLimites({...limites, limiteMensal: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limite-combustivel">Limite Combustível (R$)</Label>
                      <input
                        id="limite-combustivel"
                        type="number"
                        className="w-full px-3 py-1 border rounded"
                        value={limites.limiteCombustivel}
                        onChange={(e) => setLimites({...limites, limiteCombustivel: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limite-abastecimento">Limite Abastecimento (R$)</Label>
                      <input
                        id="limite-abastecimento"
                        type="number"
                        className="w-full px-3 py-1 border rounded"
                        value={limites.limiteAbastecimento}
                        onChange={(e) => setLimites({...limites, limiteAbastecimento: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-deputados">Mín. Deputados/Fornecedor</Label>
                      <input
                        id="min-deputados"
                        type="number"
                        className="w-full px-3 py-1 border rounded"
                        value={limites.minDeputadosFornecedor}
                        onChange={(e) => setLimites({...limites, minDeputadosFornecedor: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Análise</CardTitle>
              <CardDescription>
                Escolha quais análises devem ser executadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">✓ Superfaturamento</Badge>
                <Badge variant="secondary">✓ Limite Excedido</Badge>
                <Badge variant="secondary">✓ Fornecedores Suspeitos</Badge>
                <Badge variant="secondary">✓ Concentração Temporal</Badge>
                <Badge variant="secondary">✓ Valores Repetidos</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gerenciamento de Cache */}
        <TabsContent value="cache" className="space-y-4">
          <CacheConfig onUpdate={() => {
            // Atualizar informações se necessário
          }} />
        </TabsContent>

        {/* Gerenciamento de Dados */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup e Restauração
              </CardTitle>
              <CardDescription>
                Faça backup dos seus dados e configurações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={exportarDados} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Backup
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importarDados}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-file')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Importar Backup
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={limparDados}
                  className="flex items-center gap-2"
                >
                  Limpar Todos os Dados
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta ação remove permanentemente todos os dados salvos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Armazenamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Análises salvas</span>
                  <span className="font-medium">
                    {localStorage.getItem('ultima-analise') ? '1' : '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Espaço utilizado</span>
                  <span className="font-medium">
                    {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Limite do navegador</span>
                  <span className="font-medium">~10 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sobre */}
        <TabsContent value="sobre" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Sobre o Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Monitor de Gastos Parlamentares</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de análise e detecção de padrões suspeitos em gastos de deputados federais brasileiros.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Versão</span>
                  <span className="font-medium">2.1.1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Última atualização</span>
                  <span className="font-medium">10/06/2025</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Licença</span>
                  <span className="font-medium">MIT</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Tecnologias Utilizadas</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">Recharts</Badge>
                  <Badge variant="outline">Firebase</Badge>
                  <Badge variant="outline">Vite</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Os dados são obtidos através do portal de Dados Abertos da Câmara dos Deputados
                  e processados localmente no seu navegador para garantir privacidade e segurança.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contribua</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este é um projeto open source. Você pode contribuir com código, 
                reportar bugs ou sugerir melhorias.
              </p>
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Acessar Repositório no GitHub
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão Salvar Flutuante */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={salvarConfiguracoes}
          className="shadow-lg"
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
