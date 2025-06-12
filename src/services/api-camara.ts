// Exemplo de integração com a API da Câmara dos Deputados
// Este arquivo demonstra como seria a integração real com a API oficial

import { GastoParlamentar } from '@/types/gastos'
import { apiCache } from './cache/api-cache'

const API_BASE_URL = 'https://dadosabertos.camara.leg.br/api/v2'

export interface DeputadoAPI {
  id: number
  uri: string
  nome: string
  siglaPartido: string
  uriPartido: string
  siglaUf: string
  idLegislatura: number
  urlFoto: string
  email: string
}

export interface DespesaAPI {
  ano: number
  mes: number
  tipoDespesa: string
  codDocumento: number
  tipoDocumento: string
  codTipoDocumento: number
  dataDocumento: string
  numDocumento: string
  valorDocumento: number
  urlDocumento: string
  nomeFornecedor: string
  cnpjCpfFornecedor: string
  valorLiquido: number
  valorGlosa: number
  numRessarcimento: string
  codLote: number
  parcela: number
}

export class ApiCamaraService {
  // Buscar lista de deputados (com cache)
  async buscarDeputados(legislatura?: number): Promise<DeputadoAPI[]> {
    // Verificar cache primeiro
    const cached = await apiCache.getCachedDeputados(legislatura)
    if (cached) {
      console.log('Usando cache para lista de deputados')
      return cached
    }

    const params = new URLSearchParams()
    if (legislatura) params.append('idLegislatura', legislatura.toString())
    params.append('ordem', 'ASC')
    params.append('ordenarPor', 'nome')

    const response = await fetch(`${API_BASE_URL}/deputados?${params}`)
    const data = await response.json()
    
    // Salvar no cache
    await apiCache.setCachedDeputados(data.dados, legislatura)
    
    return data.dados
  }

  // Buscar detalhes de um deputado específico
  async buscarDeputado(id: number): Promise<DeputadoAPI> {
    const response = await fetch(`${API_BASE_URL}/deputados/${id}`)
    const data = await response.json()
    return data.dados
  }

  // Buscar despesas de um deputado (com cache)
  async buscarDespesasDeputado(
    idDeputado: number, 
    ano: number, 
    mes?: number
  ): Promise<DespesaAPI[]> {
    // Verificar cache primeiro
    if (mes) {
      const cached = await apiCache.getCachedDespesas(idDeputado, ano, mes)
      if (cached) {
        console.log(`Usando cache para despesas do deputado ${idDeputado}`)
        return cached
      }
    }

    const params = new URLSearchParams()
    params.append('ano', ano.toString())
    if (mes) params.append('mes', mes.toString())
    params.append('ordem', 'ASC')
    params.append('ordenarPor', 'ano')

    const response = await fetch(
      `${API_BASE_URL}/deputados/${idDeputado}/despesas?${params}`
    )
    const data = await response.json()
    
    // Salvar no cache se for um mês específico
    if (mes && data.dados) {
      await apiCache.setCachedDespesas(idDeputado, ano, mes, data.dados)
    }
    
    return data.dados
  }

  // Converter dados da API para o formato interno
  converterParaGastoParlamentar(
    despesa: DespesaAPI, 
    deputado: DeputadoAPI
  ): GastoParlamentar {
    return {
      txNomeParlamentar: deputado.nome,
      cpf: null, // API não fornece CPF
      ideCadastro: deputado.id.toString(),
      nuCarteiraParlamentar: null,
      nuLegislatura: deputado.idLegislatura,
      sgUF: deputado.siglaUf,
      sgPartido: deputado.siglaPartido,
      codLegislatura: deputado.idLegislatura,
      numSubCota: despesa.codTipoDocumento,
      txtDescricao: despesa.tipoDespesa,
      numEspecificacaoSubCota: 0,
      txtDescricaoEspecificacao: null,
      txtFornecedor: despesa.nomeFornecedor,
      txtCNPJCPF: despesa.cnpjCpfFornecedor,
      txtNumero: despesa.codDocumento,
      indTipoDocumento: despesa.codTipoDocumento,
      datEmissao: despesa.dataDocumento,
      vlrDocumento: despesa.valorDocumento,
      vlrGlosa: despesa.valorGlosa,
      vlrLiquido: despesa.valorLiquido,
      numMes: despesa.mes,
      numAno: despesa.ano,
      numParcela: despesa.parcela,
      txtPassageiro: null,
      txtTrecho: null,
      numLote: despesa.codLote,
      numRessarcimento: despesa.numRessarcimento,
      datPagamentoRestituicao: null,
      vlrRestituicao: null,
      nuDeputadoId: deputado.id,
      ideDocumento: despesa.codDocumento,
      urlDocumento: despesa.urlDocumento
    }
  }

  // Buscar e analisar gastos de todos os deputados (com cache inteligente)
  async analisarGastosLegislatura(
    ano: number, 
    mes?: number,
    onProgress?: (progress: number, status?: string) => void
  ): Promise<GastoParlamentar[]> {
    const deputados = await this.buscarDeputados()
    const todosGastos: GastoParlamentar[] = []
    
    // Se tem mês específico, verificar quais deputados precisam ser buscados
    let deputadosParaBuscar = deputados
    if (mes) {
      const deputadosIds = deputados.map(d => d.id)
      const idsSemCache = await apiCache.getDeputadosSemCache(deputadosIds, ano, mes)
      
      if (idsSemCache.length < deputados.length) {
        console.log(`Cache encontrado para ${deputados.length - idsSemCache.length} deputados`)
        
        // Carregar dados do cache para deputados que já tem
        for (const deputado of deputados) {
          if (!idsSemCache.includes(deputado.id)) {
            const despesasCache = await apiCache.getCachedDespesas(deputado.id, ano, mes)
            if (despesasCache) {
              const gastosConvertidos = despesasCache.map(despesa => 
                this.converterParaGastoParlamentar(despesa, deputado)
              )
              todosGastos.push(...gastosConvertidos)
            }
          }
        }
        
        deputadosParaBuscar = deputados.filter(d => idsSemCache.includes(d.id))
      }
    }

    for (let i = 0; i < deputadosParaBuscar.length; i++) {
      const deputado = deputadosParaBuscar[i]
      
      try {
        const despesas = await this.buscarDespesasDeputado(deputado.id, ano, mes)
        
        const gastosConvertidos = despesas.map(despesa => 
          this.converterParaGastoParlamentar(despesa, deputado)
        )
        
        todosGastos.push(...gastosConvertidos)
        
        if (onProgress) {
          const totalProgress = deputados.length
          const cachedCount = deputados.length - deputadosParaBuscar.length
          const currentProgress = cachedCount + (i + 1)
          const percentage = (currentProgress / totalProgress) * 100
          
          onProgress(
            percentage,
            `Processando ${deputado.nome} (${currentProgress}/${totalProgress})`
          )
        }

        // Aguardar um pouco entre requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Erro ao buscar despesas do deputado ${deputado.nome}:`, error)
      }
    }

    return todosGastos
  }
}

// Hook para usar a API
export function useApiCamara() {
  const apiService = new ApiCamaraService()

  const buscarGastosAtuais = async (onProgress?: (progress: number, status?: string) => void) => {
    const anoAtual = new Date().getFullYear()
    const mesAtual = new Date().getMonth() + 1

    return apiService.analisarGastosLegislatura(anoAtual, mesAtual, onProgress)
  }

  return {
    buscarDeputados: apiService.buscarDeputados.bind(apiService),
    buscarDeputado: apiService.buscarDeputado.bind(apiService),
    buscarDespesasDeputado: apiService.buscarDespesasDeputado.bind(apiService),
    buscarGastosAtuais
  }
}

/*
EXEMPLO DE USO:

import { useApiCamara } from '@/services/api-camara'
import { analisadorGastos } from '@/services/analisador-gastos'

function MinhaComponente() {
  const { buscarGastosAtuais } = useApiCamara()
  const [progresso, setProgresso] = useState(0)
  const [carregando, setCarregando] = useState(false)

  const analisarGastosAPI = async () => {
    setCarregando(true)
    
    try {
      // Buscar dados da API
      const gastos = await buscarGastosAtuais((progress) => {
        setProgresso(progress)
      })

      // Analisar com o mesmo analisador
      const analise = analisadorGastos.analisarGastos(gastos)
      
      // Salvar no localStorage ou Firebase
      localStorage.setItem('ultima-analise', JSON.stringify({
        data: new Date().toISOString(),
        arquivo: 'API da Câmara',
        analise
      }))

    } catch (error) {
      console.error('Erro ao buscar dados da API:', error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <Button onClick={analisarGastosAPI} disabled={carregando}>
        {carregando ? `Analisando... ${progresso.toFixed(0)}%` : 'Buscar da API'}
      </Button>
    </div>
  )
}
*/
