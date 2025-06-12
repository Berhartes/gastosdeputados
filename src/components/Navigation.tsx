import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/NotificationCenter'
import { FileUp, LayoutDashboard, AlertTriangle, FileText, Users, User, GitCompare, Settings, Building2, Brain } from 'lucide-react'

interface NavigationProps {
  currentPage: 'dashboard' | 'alertas' | 'relatorios' | 'perfil' | 'deputados' | 'comparar' | 'configuracoes' | 'fornecedores' | 'analise-avancada' // 'upload' removido
  onPageChange: (page: 'dashboard' | 'alertas' | 'relatorios' | 'perfil' | 'deputados' | 'comparar' | 'configuracoes' | 'fornecedores' | 'analise-avancada') => void // 'upload' removido
  deputadoSelecionado?: any
}

export function Navigation({ currentPage, onPageChange, deputadoSelecionado }: NavigationProps) {
  const navItems = [
    // { id: 'upload', label: 'Upload', icon: FileUp }, // Item de Upload removido
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analise-avancada', label: 'Análise IA', icon: Brain },
    { id: 'deputados', label: 'Deputados', icon: Users },
    { id: 'fornecedores', label: 'Fornecedores', icon: Building2 },
    { id: 'comparar', label: 'Comparar', icon: GitCompare },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
  ] as const

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 flex">
            <h1 className="text-lg font-semibold">Monitor de Gastos Parlamentares</h1>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'flex items-center gap-2',
                    currentPage === item.id && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
            {currentPage === 'perfil' && (
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-primary text-primary-foreground"
              >
                <User className="h-4 w-4" />
                {deputadoSelecionado?.nome || 'Perfil do Deputado'}
              </Button>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button
            variant={currentPage === 'configuracoes' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange('configuracoes')}
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
