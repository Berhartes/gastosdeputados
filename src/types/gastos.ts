export interface GastoParlamentar {
  txNomeParlamentar: string
  cpf: string | null
  ideCadastro: string | null
  nuCarteiraParlamentar: string | null
  nuLegislatura: number
  sgUF: string
  sgPartido: string | null
  codLegislatura: number
  numSubCota: number
  txtDescricao: string
  numEspecificacaoSubCota: number
  txtDescricaoEspecificacao: string | null
  txtFornecedor: string
  txtCNPJCPF: string
  txtNumero: number
  indTipoDocumento: number
  datEmissao: string
  vlrDocumento: number
  vlrGlosa: number
  vlrLiquido: number
  numMes: number
  numAno: number
  numParcela: number
  txtPassageiro: string | null
  txtTrecho: string | null
  numLote: number
  numRessarcimento: string | null
  datPagamentoRestituicao: string | null
  vlrRestituicao: string | null
  nuDeputadoId: number
  ideDocumento: number
  urlDocumento: string
}

export interface AlertaSuspeito {
  id: string
  tipo: 'SUPERFATURAMENTO' | 'LIMITE_EXCEDIDO' | 'FORNECEDOR_SUSPEITO' | 'CONCENTRACAO_TEMPORAL' | 'VALOR_REPETIDO'
  gravidade: 'ALTA' | 'MEDIA' | 'BAIXA'
  deputado: string
  descricao: string
  valor: number
  detalhes: Record<string, any>
  dataDeteccao: Date
}

export interface FornecedorSuspeito {
  cnpj: string
  nome: string
  totalRecebido: number
  numTransacoes: number
  deputadosAtendidos: number
  deputadosNomes?: string[] // Array com nomes dos deputados
  mediaTransacao: number
  indiceSuspeicao: number
  alertas: string[]
  razoesSuspeita?: string[] // Alias para alertas
  categorias?: string[] // Categorias de despesas atendidas
}

export interface AnaliseDeputado {
  nome: string
  partido: string
  uf: string
  totalGasto: number
  numTransacoes: number
  gastoMedio: number
  maioresCategorias: {
    categoria: string
    valor: number
    percentual: number
  }[]
  alertas: AlertaSuspeito[]
  scoreSuspeicao: number
}

export interface RelatorioAnalise {
  dataAnalise: Date
  periodoAnalisado: {
    inicio: Date
    fim: Date
  }
  totalRegistros: number
  totalGasto: number
  numDeputados: number
  alertasGerados: number
  deputadosSuspeitos: AnaliseDeputado[]
  fornecedoresSuspeitos: FornecedorSuspeito[]
  padroesSuspeitos: {
    tipo: string
    ocorrencias: number
    descricao: string
  }[]
}
