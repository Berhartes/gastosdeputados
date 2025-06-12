import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Dashboard } from '@/pages/Dashboard'
// import { UploadPage } from '@/pages/UploadPage' // Removido
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import { AlertasPage } from '@/pages/AlertasPage'
import { PerfilDeputado } from '@/pages/PerfilDeputado'
import { ListaDeputados } from '@/pages/ListaDeputados'
import { CompararDeputados } from '@/pages/CompararDeputados'
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage'
import { AnaliseAvancadaPage } from '@/pages/AnaliseAvancadaPage'
import { FornecedoresPage } from '@/pages/FornecedoresPage'
import { Navigation } from '@/components/Navigation'
import { BuscaGlobal } from '@/components/BuscaGlobal'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'alertas' | 'relatorios' | 'perfil' | 'deputados' | 'comparar' | 'configuracoes' | 'analise-avancada' | 'fornecedores'>('dashboard') // 'upload' removido e 'dashboard' como padrão
  const [deputadoSelecionado, setDeputadoSelecionado] = useState<any>(null)

  const handleSelectDeputado = (deputado: any) => {
    setDeputadoSelecionado(deputado)
    setCurrentPage('perfil')
  }

  const handleViewProfile = () => {
    setCurrentPage('perfil')
  }

  const handleSelectFornecedor = (fornecedor: any) => {
    console.log('Fornecedor selecionado:', fornecedor)
    // Implementar navegação para página de fornecedor
  }

  const handleSelectAlerta = (alerta: any) => {
    setCurrentPage('alertas')
    // Implementar filtro automático na página de alertas
  }

  // Carregar dados de exemplo
  const deputadosExemplo = [
    {
      nome: "General Pazuello",
      partido: "PL",
      uf: "RJ",
      totalGasto: 49131.34,
      scoreSuspeicao: 25,
      alertas: [
        { tipo: 'LIMITE_EXCEDIDO', gravidade: 'MEDIA', descricao: 'Gasto próximo ao limite' }
      ],
      numTransacoes: 45,
      gastoMedio: 1091.81,
      maioresCategorias: [
        { categoria: 'Passagens Aéreas', valor: 15556.95, percentual: 31.7 },
        { categoria: 'Divulgação', valor: 13000.00, percentual: 26.5 },
        { categoria: 'Manutenção de Escritório', valor: 9252.02, percentual: 18.8 }
      ]
    },
    {
      nome: "Dilvanda Faro",
      partido: "PT",
      uf: "PA",
      totalGasto: 85000.00,
      scoreSuspeicao: 85,
      alertas: [
        { tipo: 'SUPERFATURAMENTO', gravidade: 'ALTA', descricao: 'Combustível R$ 8.500' },
        { tipo: 'FORNECEDOR_SUSPEITO', gravidade: 'ALTA', descricao: 'Fornecedor atende apenas 2 deputados' }
      ],
      numTransacoes: 67,
      gastoMedio: 1268.66,
      maioresCategorias: [
        { categoria: 'Combustíveis', valor: 51000.00, percentual: 60.0 },
        { categoria: 'Divulgação', valor: 20000.00, percentual: 23.5 },
        { categoria: 'Escritório', valor: 14000.00, percentual: 16.5 }
      ]
    },
    {
      nome: "João Silva",
      partido: "MDB",
      uf: "SP",
      totalGasto: 42000.00,
      scoreSuspeicao: 15,
      alertas: [],
      numTransacoes: 38,
      gastoMedio: 1105.26,
      maioresCategorias: [
        { categoria: 'Escritório', valor: 18000.00, percentual: 42.9 },
        { categoria: 'Telefonia', valor: 12000.00, percentual: 28.6 },
        { categoria: 'Passagens', valor: 12000.00, percentual: 28.6 }
      ]
    },
    {
      nome: "Maria Santos",
      partido: "PSDB",
      uf: "MG",
      totalGasto: 38500.00,
      scoreSuspeicao: 45,
      alertas: [
        { tipo: 'VALOR_REPETIDO', gravidade: 'MEDIA', descricao: 'Múltiplos gastos de R$ 5.000' }
      ],
      numTransacoes: 42,
      gastoMedio: 916.67,
      maioresCategorias: [
        { categoria: 'Divulgação', valor: 15000.00, percentual: 38.9 },
        { categoria: 'Combustível', valor: 13500.00, percentual: 35.1 },
        { categoria: 'Escritório', valor: 10000.00, percentual: 26.0 }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        deputadoSelecionado={deputadoSelecionado}
      />
      
      <main className="container mx-auto py-6">
        {/* Bloco de UploadPage removido */}
        {currentPage === 'dashboard' && (
          <Dashboard onViewProfile={handleViewProfile} />
        )}
        {currentPage === 'alertas' && (
          <AlertasPage onViewProfile={handleViewProfile} />
        )}
        {currentPage === 'relatorios' && (
          <RelatoriosPage />
        )}
        {currentPage === 'deputados' && (
          <ListaDeputados onSelectDeputado={handleSelectDeputado} />
        )}
        {currentPage === 'comparar' && (
          <CompararDeputados deputados={deputadosExemplo} />
        )}
        {currentPage === 'perfil' && (
          <PerfilDeputado deputado={deputadoSelecionado} />
        )}
        {currentPage === 'configuracoes' && (
          <ConfiguracoesPage />
        )}
        {currentPage === 'analise-avancada' && (
          <AnaliseAvancadaPage onSelectDeputado={handleSelectDeputado} />
        )}
        {currentPage === 'fornecedores' && (
          <FornecedoresPage />
        )}
      </main>

      {/* Busca Global */}
      <BuscaGlobal
        onSelectDeputado={handleSelectDeputado}
        onSelectFornecedor={handleSelectFornecedor}
        onSelectAlerta={handleSelectAlerta}
      />

      <Toaster />
    </div>
  )
}

export default App
