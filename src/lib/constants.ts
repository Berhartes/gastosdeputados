// Limites padrão do sistema
export const LIMITES_PADRAO = {
  MENSAL: 45000, // Limite mensal de gastos
  COMBUSTIVEL: 1000, // Limite normal para combustível
  ABASTECIMENTO_SUSPEITO: 2000, // Valor suspeito para abastecimento
  MIN_DEPUTADOS_FORNECEDOR: 5, // Mínimo de deputados por fornecedor
  TRANSACOES_DIA: 5, // Máximo de transações por dia
  VALOR_ALTO: 1000, // Valor considerado alto para análise
  OCORRENCIAS_VALOR_REPETIDO: 10 // Mínimo de ocorrências para alerta de valor repetido
}

// Cores do sistema
export const CORES = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
  PURPLE: '#8B5CF6',
  GRAY: '#6B7280',
  CHART: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280']
}

// Configurações de gravidade
export const GRAVIDADE = {
  ALTA: {
    score: 30,
    cor: CORES.ERROR,
    label: 'Alta'
  },
  MEDIA: {
    score: 15,
    cor: CORES.WARNING,
    label: 'Média'
  },
  BAIXA: {
    score: 5,
    cor: CORES.INFO,
    label: 'Baixa'
  }
}

// Tipos de alertas
export const TIPOS_ALERTA = {
  SUPERFATURAMENTO: {
    label: 'Superfaturamento',
    descricao: 'Valores anormalmente altos para o tipo de gasto',
    scoreBonus: 20,
    icone: '💰'
  },
  LIMITE_EXCEDIDO: {
    label: 'Limite Excedido',
    descricao: 'Gastos mensais acima do limite permitido',
    scoreBonus: 25,
    icone: '🚫'
  },
  FORNECEDOR_SUSPEITO: {
    label: 'Fornecedor Suspeito',
    descricao: 'Fornecedor com padrão anômalo de atendimento',
    scoreBonus: 15,
    icone: '🏢'
  },
  CONCENTRACAO_TEMPORAL: {
    label: 'Concentração Temporal',
    descricao: 'Múltiplas transações em curto período',
    scoreBonus: 10,
    icone: '⏰'
  },
  VALOR_REPETIDO: {
    label: 'Valor Repetido',
    descricao: 'Valores idênticos repetidos suspeitos',
    scoreBonus: 12,
    icone: '🔄'
  }
}

// Categorias de gastos parlamentares
export const CATEGORIAS_GASTOS = {
  'COMBUSTÍVEIS E LUBRIFICANTES': {
    limite: LIMITES_PADRAO.COMBUSTIVEL,
    descricao: 'Abastecimento de veículos oficiais',
    icone: '⛽'
  },
  'DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR': {
    limite: 8000,
    descricao: 'Material de divulgação e publicidade',
    icone: '📢'
  },
  'MANUTENÇÃO DE ESCRITÓRIO DE APOIO': {
    limite: 15000,
    descricao: 'Despesas com escritório parlamentar',
    icone: '🏢'
  },
  'PASSAGENS AÉREAS': {
    limite: 20000,
    descricao: 'Viagens aéreas a serviço',
    icone: '✈️'
  },
  'LOCAÇÃO OU FRETAMENTO DE VEÍCULOS': {
    limite: 10000,
    descricao: 'Aluguel de veículos',
    icone: '🚗'
  },
  'TELEFONIA': {
    limite: 3000,
    descricao: 'Serviços de telefonia',
    icone: '📱'
  },
  'HOSPEDAGEM': {
    limite: 5000,
    descricao: 'Hospedagem em viagens',
    icone: '🏨'
  }
}

// Estados brasileiros
export const ESTADOS = {
  'AC': 'Acre',
  'AL': 'Alagoas', 
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
}

// Configurações de performance
export const PERFORMANCE = {
  MAX_REGISTROS_MEMORIA: 100000, // Máximo de registros na memória
  CHUNK_SIZE: 1000, // Tamanho do chunk para processamento
  TIMEOUT_ANALISE: 300000, // Timeout de 5 minutos para análise
  DEBOUNCE_BUSCA: 300, // Debounce para busca em ms
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutos de cache
}

// URLs e APIs
export const APIS = {
  CAMARA_BASE: 'https://dadosabertos.camara.leg.br/api/v2',
  SENADO_BASE: 'https://legis.senado.leg.br/dadosabertos',
  TCU_BASE: 'https://api.portaldatransparencia.gov.br/api-de-dados'
}

// Configurações de exportação
export const EXPORTACAO = {
  FORMATOS: ['CSV', 'JSON', 'TXT', 'HTML', 'PDF'],
  MAX_REGISTROS_CSV: 50000,
  SEPARADOR_CSV: ';',
  ENCODING: 'UTF-8'
}

// Mensagens do sistema
export const MENSAGENS = {
  UPLOAD: {
    SUCESSO: 'Arquivo processado com sucesso!',
    ERRO_FORMATO: 'Formato de arquivo inválido. Use apenas CSV.',
    ERRO_TAMANHO: 'Arquivo muito grande. Máximo permitido: 50MB.',
    ERRO_VAZIO: 'Arquivo vazio ou sem dados válidos.',
    PROCESSANDO: 'Processando arquivo...'
  },
  ANALISE: {
    INICIADA: 'Análise iniciada...',
    CONCLUIDA: 'Análise concluída com sucesso!',
    ERRO: 'Erro durante a análise dos dados.',
    SEM_DADOS: 'Nenhum dado encontrado para análise.'
  },
  VALIDACAO: {
    CAMPOS_OBRIGATORIOS: 'Campos obrigatórios não preenchidos.',
    FORMATO_INVALIDO: 'Formato de dado inválido.',
    VALOR_LIMITE: 'Valor fora do limite permitido.'
  }
}

// Configurações de navegação
export const NAVEGACAO = {
  PAGINAS: [
    { id: 'upload', label: 'Upload', rota: '/' },
    { id: 'dashboard', label: 'Dashboard', rota: '/dashboard' },
    { id: 'deputados', label: 'Deputados', rota: '/deputados' },
    { id: 'comparar', label: 'Comparar', rota: '/comparar' },
    { id: 'alertas', label: 'Alertas', rota: '/alertas' },
    { id: 'relatorios', label: 'Relatórios', rota: '/relatorios' },
    { id: 'configuracoes', label: 'Configurações', rota: '/configuracoes' }
  ]
}

// Regex e validações
export const VALIDACOES = {
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  DATA: /^\d{4}-\d{2}-\d{2}$/,
  VALOR: /^\d+\.?\d*$/
}

// Configurações de tema
export const TEMA = {
  BREAKPOINTS: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  ESPACAMENTOS: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  DURACAO_ANIMACAO: {
    rapida: '150ms',
    normal: '300ms',
    lenta: '500ms'
  }
}

// Configurações de armazenamento
export const STORAGE = {
  KEYS: {
    CONFIGURACOES: 'configuracoes',
    ULTIMA_ANALISE: 'ultima-analise',
    LIMITES_ANALISE: 'limites-analise',
    DEPUTADOS_FAVORITOS: 'deputados-favoritos',
    HISTORICO_BUSCAS: 'historico-buscas'
  },
  MAX_TAMANHO: 10 * 1024 * 1024, // 10MB
  COMPRESSAO: true
}

// Configurações de monitoramento
export const MONITORAMENTO = {
  METRICAS_ATIVAS: true,
  LOGS_CONSOLE: process.env.NODE_ENV === 'development',
  TRACKING_EVENTOS: false, // Desabilitado por padrão
  RELATORIO_PERFORMANCE: true
}
