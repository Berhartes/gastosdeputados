import { GastoParlamentar, AlertaSuspeito, FornecedorSuspeito, AnaliseDeputado } from '@/types/gastos'
import _ from 'lodash'

export class AnalisadorGastos {
  private readonly LIMITE_MENSAL = 45000
  private readonly LIMITE_COMBUSTIVEL = 1000
  private readonly LIMITE_ABASTECIMENTO_SUSPEITO = 2000
  private readonly MIN_DEPUTADOS_FORNECEDOR = 5
  private readonly LIMITE_TRANSACOES_DIA = 5

  analisarGastos(gastos: GastoParlamentar[]) {
    const alertas: AlertaSuspeito[] = []
    
    // Filtrar registros válidos
    const gastosValidos = gastos.filter(g => 
      g.txNomeParlamentar && 
      g.txNomeParlamentar !== "LID.GOV-CD" && 
      g.txNomeParlamentar !== ""
    )

    // Análises
    const alertasCombustivel = this.detectarSuperfaturamentoCombustivel(gastosValidos)
    const alertasLimite = this.detectarGastosAcimaLimite(gastosValidos)
    const alertasFornecedores = this.detectarFornecedoresSuspeitos(gastosValidos)
    const alertasConcentracao = this.detectarConcentracaoTemporal(gastosValidos)
    const alertasValores = this.detectarValoresRepetidos(gastosValidos)

    alertas.push(...alertasCombustivel, ...alertasLimite, ...alertasFornecedores, 
                  ...alertasConcentracao, ...alertasValores)

    const deputadosAnalise = this.analisarDeputados(gastosValidos, alertas)
    const fornecedoresSuspeitos = this.listarFornecedoresSuspeitos(gastosValidos)

    return {
      alertas,
      deputadosAnalise,
      fornecedoresSuspeitos,
      estatisticas: this.calcularEstatisticas(gastosValidos)
    }
  }

  private detectarSuperfaturamentoCombustivel(gastos: GastoParlamentar[]): AlertaSuspeito[] {
    const alertas: AlertaSuspeito[] = []
    
    const gastosCombustivel = gastos.filter(g => 
      g.txtDescricao && g.txtDescricao.includes('COMBUSTÍVEIS')
    )

    const porDeputado = _.groupBy(gastosCombustivel, 'txNomeParlamentar')

    Object.entries(porDeputado).forEach(([deputado, transacoes]) => {
      transacoes.forEach(t => {
        if (t.vlrLiquido > this.LIMITE_ABASTECIMENTO_SUSPEITO) {
          alertas.push({
            id: `COMB-${t.ideDocumento}`,
            tipo: 'SUPERFATURAMENTO',
            gravidade: t.vlrLiquido > 5000 ? 'ALTA' : 'MEDIA',
            deputado: deputado,
            descricao: `Abastecimento suspeito de R$ ${t.vlrLiquido.toFixed(2)} (normal: R$ 300-500)`,
            valor: t.vlrLiquido,
            detalhes: {
              fornecedor: t.txtFornecedor,
              data: t.datEmissao,
              cnpj: t.txtCNPJCPF,
              valorNormal: 400,
              percentualAcima: ((t.vlrLiquido / 400 - 1) * 100).toFixed(1)
            },
            dataDeteccao: new Date()
          })
        }
      })

      const mediaAbastecimento = _.meanBy(transacoes, 'vlrLiquido')
      if (mediaAbastecimento > this.LIMITE_COMBUSTIVEL) {
        alertas.push({
          id: `COMB-MEDIA-${deputado}`,
          tipo: 'SUPERFATURAMENTO',
          gravidade: 'ALTA',
          deputado: deputado,
          descricao: `Média de abastecimento de R$ ${mediaAbastecimento.toFixed(2)} (${transacoes.length} abastecimentos)`,
          valor: _.sumBy(transacoes, 'vlrLiquido'),
          detalhes: {
            numAbastecimentos: transacoes.length,
            mediaAbastecimento,
            postosUnicos: _.uniqBy(transacoes, 'txtCNPJCPF').length
          },
          dataDeteccao: new Date()
        })
      }
    })

    return alertas
  }

  private detectarGastosAcimaLimite(gastos: GastoParlamentar[]): AlertaSuspeito[] {
    const alertas: AlertaSuspeito[] = []
    
    const gastosMensais = _.groupBy(gastos, g => 
      `${g.txNomeParlamentar}|${g.numMes}|${g.numAno}`
    )

    Object.entries(gastosMensais).forEach(([chave, transacoes]) => {
      const [deputado, mes, ano] = chave.split('|')
      const totalMes = _.sumBy(transacoes, 'vlrLiquido')
      
      if (totalMes > this.LIMITE_MENSAL) {
        const percentual = (totalMes / this.LIMITE_MENSAL * 100).toFixed(1)
        alertas.push({
          id: `LIMITE-${deputado}-${mes}-${ano}`,
          tipo: 'LIMITE_EXCEDIDO',
          gravidade: totalMes > this.LIMITE_MENSAL * 2 ? 'ALTA' : 'MEDIA',
          deputado: deputado,
          descricao: `Gasto de R$ ${totalMes.toFixed(2)} em ${mes}/${ano} (${percentual}% do limite)`,
          valor: totalMes,
          detalhes: {
            mes: parseInt(mes),
            ano: parseInt(ano),
            limite: this.LIMITE_MENSAL,
            percentualExcedido: percentual,
            numTransacoes: transacoes.length,
            maioresGastos: _.orderBy(transacoes, 'vlrLiquido', 'desc')
              .slice(0, 5)
              .map(t => ({
                fornecedor: t.txtFornecedor,
                valor: t.vlrLiquido,
                descricao: t.txtDescricao
              }))
          },
          dataDeteccao: new Date()
        })
      }
    })

    return alertas
  }

  private detectarFornecedoresSuspeitos(gastos: GastoParlamentar[]): AlertaSuspeito[] {
    const alertas: AlertaSuspeito[] = []
    
    const porFornecedor = _.groupBy(gastos.filter(g => g.txtCNPJCPF), 'txtCNPJCPF')

    Object.entries(porFornecedor).forEach(([cnpj, transacoes]) => {
      const deputadosUnicos = _.uniqBy(transacoes, 'txNomeParlamentar')
      const mediaTransacao = _.meanBy(transacoes, 'vlrLiquido')
      
      if (deputadosUnicos.length < this.MIN_DEPUTADOS_FORNECEDOR && 
          _.sumBy(transacoes, 'vlrLiquido') > 100000) {
        
        const fornecedor = transacoes[0].txtFornecedor
        
        alertas.push({
          id: `FORN-${cnpj}`,
          tipo: 'FORNECEDOR_SUSPEITO',
          gravidade: deputadosUnicos.length <= 2 ? 'ALTA' : 'MEDIA',
          deputado: 'MÚLTIPLOS',
          descricao: `Fornecedor ${fornecedor} atende apenas ${deputadosUnicos.length} deputados com média de R$ ${mediaTransacao.toFixed(2)}/transação`,
          valor: _.sumBy(transacoes, 'vlrLiquido'),
          detalhes: {
            cnpj,
            fornecedor,
            deputadosAtendidos: deputadosUnicos.map(d => d.txNomeParlamentar),
            numTransacoes: transacoes.length,
            mediaTransacao,
            totalRecebido: _.sumBy(transacoes, 'vlrLiquido')
          },
          dataDeteccao: new Date()
        })
      }

      // Detectar médias muito altas
      if (mediaTransacao > 10000) {
        alertas.push({
          id: `FORN-MEDIA-${cnpj}`,
          tipo: 'FORNECEDOR_SUSPEITO',
          gravidade: 'ALTA',
          deputado: 'MÚLTIPLOS',
          descricao: `Fornecedor ${transacoes[0].txtFornecedor} com média muito alta: R$ ${mediaTransacao.toFixed(2)}`,
          valor: _.sumBy(transacoes, 'vlrLiquido'),
          detalhes: {
            cnpj,
            fornecedor: transacoes[0].txtFornecedor,
            numTransacoes: transacoes.length,
            mediaTransacao,
            transacoesAltas: transacoes.filter(t => t.vlrLiquido > 20000).length
          },
          dataDeteccao: new Date()
        })
      }
    })

    return alertas
  }

  private detectarConcentracaoTemporal(gastos: GastoParlamentar[]): AlertaSuspeito[] {
    const alertas: AlertaSuspeito[] = []
    
    const porDeputadoDia = _.groupBy(gastos, g => 
      `${g.txNomeParlamentar}|${g.datEmissao}`
    )

    Object.entries(porDeputadoDia).forEach(([chave, transacoes]) => {
      if (transacoes.length >= this.LIMITE_TRANSACOES_DIA) {
        const [deputado, data] = chave.split('|')
        const total = _.sumBy(transacoes, 'vlrLiquido')
        
        alertas.push({
          id: `CONC-${deputado}-${data}`,
          tipo: 'CONCENTRACAO_TEMPORAL',
          gravidade: transacoes.length > 10 ? 'ALTA' : 'MEDIA',
          deputado: deputado,
          descricao: `${transacoes.length} transações em um único dia (${data})`,
          valor: total,
          detalhes: {
            data,
            numTransacoes: transacoes.length,
            fornecedores: _.uniqBy(transacoes, 'txtFornecedor').map(t => t.txtFornecedor),
            categorias: _.uniq(transacoes.map(t => t.txtDescricao))
          },
          dataDeteccao: new Date()
        })
      }
    })

    return alertas
  }

  private detectarValoresRepetidos(gastos: GastoParlamentar[]): AlertaSuspeito[] {
    const alertas: AlertaSuspeito[] = []
    
    const valoresAltos = gastos.filter(g => g.vlrLiquido >= 1000)
    const porValor = _.groupBy(valoresAltos, 'vlrLiquido')

    Object.entries(porValor).forEach(([valor, transacoes]) => {
      if (transacoes.length >= 10) {
        const deputadosUnicos = _.uniqBy(transacoes, 'txNomeParlamentar')
        const fornecedoresUnicos = _.uniqBy(transacoes, 'txtCNPJCPF')
        
        if (fornecedoresUnicos.length <= 3) {
          alertas.push({
            id: `VALOR-${valor}`,
            tipo: 'VALOR_REPETIDO',
            gravidade: fornecedoresUnicos.length === 1 ? 'ALTA' : 'MEDIA',
            deputado: 'MÚLTIPLOS',
            descricao: `Valor exato de R$ ${parseFloat(valor).toFixed(2)} aparece ${transacoes.length} vezes`,
            valor: parseFloat(valor),
            detalhes: {
              ocorrencias: transacoes.length,
              deputados: deputadosUnicos.length,
              fornecedores: fornecedoresUnicos.length,
              descricoes: _.uniq(transacoes.map(t => t.txtDescricao))
            },
            dataDeteccao: new Date()
          })
        }
      }
    })

    return alertas
  }

  private analisarDeputados(gastos: GastoParlamentar[], alertas: AlertaSuspeito[]): AnaliseDeputado[] {
    const porDeputado = _.groupBy(gastos, 'txNomeParlamentar')
    const alertasPorDeputado = _.groupBy(alertas.filter(a => a.deputado !== 'MÚLTIPLOS'), 'deputado')

    return Object.entries(porDeputado).map(([nome, transacoes]) => {
      const totalGasto = _.sumBy(transacoes, 'vlrLiquido')
      const porCategoria = _.groupBy(transacoes, 'txtDescricao')
      
      const maioresCategorias = Object.entries(porCategoria)
        .map(([categoria, trans]) => ({
          categoria,
          valor: _.sumBy(trans, 'vlrLiquido'),
          percentual: (_.sumBy(trans, 'vlrLiquido') / totalGasto) * 100
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5)

      const alertasDeputado = alertasPorDeputado[nome] || []
      const scoreSuspeicao = this.calcularScoreSuspeicao(alertasDeputado)

      return {
        nome,
        partido: transacoes[0].sgPartido || '',
        uf: transacoes[0].sgUF,
        totalGasto,
        numTransacoes: transacoes.length,
        gastoMedio: totalGasto / transacoes.length,
        maioresCategorias,
        alertas: alertasDeputado,
        scoreSuspeicao
      }
    }).sort((a, b) => b.scoreSuspeicao - a.scoreSuspeicao)
  }

  private listarFornecedoresSuspeitos(gastos: GastoParlamentar[]): FornecedorSuspeito[] {
    const porFornecedor = _.groupBy(gastos.filter(g => g.txtCNPJCPF), 'txtCNPJCPF')

    return Object.entries(porFornecedor)
      .map(([cnpj, transacoes]) => {
        const deputadosUnicos = _.uniqBy(transacoes, 'txNomeParlamentar')
        const totalRecebido = _.sumBy(transacoes, 'vlrLiquido')
        const mediaTransacao = totalRecebido / transacoes.length
        
        const alertas: string[] = []
        let indiceSuspeicao = 0

        if (deputadosUnicos.length < 5) {
          alertas.push(`Atende apenas ${deputadosUnicos.length} deputados`)
          indiceSuspeicao += 30
        }

        if (mediaTransacao > 10000) {
          alertas.push(`Média por transação muito alta: R$ ${mediaTransacao.toFixed(2)}`)
          indiceSuspeicao += 40
        }

        if (totalRecebido > 500000 && deputadosUnicos.length < 10) {
          alertas.push('Alto faturamento com poucos clientes')
          indiceSuspeicao += 30
        }

        // Extrair categorias únicas das transações
        const categorias = _.uniq(transacoes.map(t => t.txtDescricao).filter(d => d))

        return {
          cnpj,
          nome: transacoes[0].txtFornecedor,
          totalRecebido,
          numTransacoes: transacoes.length,
          deputadosAtendidos: deputadosUnicos.length,
          deputadosNomes: deputadosUnicos.map(d => d.txNomeParlamentar), // Array com nomes dos deputados
          mediaTransacao,
          indiceSuspeicao,
          alertas,
          razoesSuspeita: alertas, // Alias para alertas
          categorias // Categorias de despesas atendidas
        }
      })
      // Remover o filtro para incluir TODOS os fornecedores
      .sort((a, b) => b.indiceSuspeicao - a.indiceSuspeicao)
  }

  private calcularScoreSuspeicao(alertas: AlertaSuspeito[]): number {
    let score = 0
    
    alertas.forEach(alerta => {
      switch (alerta.gravidade) {
        case 'ALTA':
          score += 30
          break
        case 'MEDIA':
          score += 15
          break
        case 'BAIXA':
          score += 5
          break
      }

      // Bonus por tipo de alerta
      if (alerta.tipo === 'SUPERFATURAMENTO') score += 20
      if (alerta.tipo === 'LIMITE_EXCEDIDO' && alerta.valor > 100000) score += 25
    })

    return Math.min(score, 100)
  }

  private calcularEstatisticas(gastos: GastoParlamentar[]) {
    const deputadosUnicos = _.uniqBy(gastos, 'txNomeParlamentar')
    const fornecedoresUnicos = _.uniqBy(gastos, 'txtCNPJCPF')
    
    return {
      totalGasto: _.sumBy(gastos, 'vlrLiquido'),
      totalRegistros: gastos.length,
      numDeputados: deputadosUnicos.length,
      numFornecedores: fornecedoresUnicos.length,
      mediaGastoPorDeputado: _.sumBy(gastos, 'vlrLiquido') / deputadosUnicos.length,
      categoriasMaisGastos: this.getTopCategorias(gastos)
    }
  }

  private getTopCategorias(gastos: GastoParlamentar[]) {
    const porCategoria = _.groupBy(gastos, 'txtDescricao')
    
    return Object.entries(porCategoria)
      .map(([categoria, trans]) => ({
        categoria,
        total: _.sumBy(trans, 'vlrLiquido'),
        numTransacoes: trans.length
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }
}

export const analisadorGastos = new AnalisadorGastos()
