import { describe, it, expect, beforeEach } from 'vitest'
import { AnalisadorGastos } from '@/services/analisador-gastos'
import { GastoParlamentar } from '@/types/gastos'

describe('AnalisadorGastos', () => {
  let analisador: AnalisadorGastos
  
  beforeEach(() => {
    analisador = new AnalisadorGastos()
  })

  describe('detectarSuperfaturamentoCombustivel', () => {
    it('deve detectar superfaturamento em combustível', () => {
      const gastos: GastoParlamentar[] = [
        {
          txNomeParlamentar: 'Deputado Teste',
          cpf: '12345678900',
          ideCadastro: '001',
          nuCarteiraParlamentar: '123',
          nuLegislatura: 2023,
          sgUF: 'SP',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 3,
          txtDescricao: 'COMBUSTÍVEIS E LUBRIFICANTES',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Posto Teste',
          txtCNPJCPF: '12.345.678/0001-90',
          txtNumero: 1001,
          indTipoDocumento: 0,
          datEmissao: '2025-01-01',
          vlrDocumento: 8500,
          vlrGlosa: 0,
          vlrLiquido: 8500,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100001,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1001,
          ideDocumento: 2001,
          urlDocumento: 'https://exemplo.com/doc1.pdf'
        }
      ]

      const resultado = analisador.analisarGastos(gastos)
      
      expect(resultado.alertas).toHaveLength(1)
      expect(resultado.alertas[0].tipo).toBe('SUPERFATURAMENTO')
      expect(resultado.alertas[0].gravidade).toBe('ALTA')
      expect(resultado.alertas[0].valor).toBe(8500)
    })

    it('não deve gerar alerta para valores normais de combustível', () => {
      const gastos: GastoParlamentar[] = [
        {
          txNomeParlamentar: 'Deputado Teste',
          cpf: '12345678900',
          ideCadastro: '001',
          nuCarteiraParlamentar: '123',
          nuLegislatura: 2023,
          sgUF: 'SP',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 3,
          txtDescricao: 'COMBUSTÍVEIS E LUBRIFICANTES',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Posto Normal',
          txtCNPJCPF: '12.345.678/0001-90',
          txtNumero: 1001,
          indTipoDocumento: 0,
          datEmissao: '2025-01-01',
          vlrDocumento: 400,
          vlrGlosa: 0,
          vlrLiquido: 400,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100001,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1001,
          ideDocumento: 2001,
          urlDocumento: 'https://exemplo.com/doc1.pdf'
        }
      ]

      const resultado = analisador.analisarGastos(gastos)
      const alertasCombustivel = resultado.alertas.filter(a => a.tipo === 'SUPERFATURAMENTO')
      
      expect(alertasCombustivel).toHaveLength(0)
    })
  })

  describe('detectarGastosAcimaLimite', () => {
    it('deve detectar gastos acima do limite mensal', () => {
      const gastos: GastoParlamentar[] = []
      
      // Adicionar múltiplos gastos para o mesmo deputado no mesmo mês
      for (let i = 0; i < 10; i++) {
        gastos.push({
          txNomeParlamentar: 'Deputado Gastador',
          cpf: '98765432100',
          ideCadastro: '002',
          nuCarteiraParlamentar: '124',
          nuLegislatura: 2023,
          sgUF: 'RJ',
          sgPartido: 'GASTO',
          codLegislatura: 57,
          numSubCota: 1,
          txtDescricao: 'MANUTENÇÃO DE ESCRITÓRIO',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: `Fornecedor ${i}`,
          txtCNPJCPF: `12.345.678/000${i}-90`,
          txtNumero: 2000 + i,
          indTipoDocumento: 0,
          datEmissao: '2025-01-15',
          vlrDocumento: 10000,
          vlrGlosa: 0,
          vlrLiquido: 10000,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100002 + i,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1002,
          ideDocumento: 3000 + i,
          urlDocumento: `https://exemplo.com/doc${i}.pdf`
        })
      }

      const resultado = analisador.analisarGastos(gastos)
      const alertasLimite = resultado.alertas.filter(a => a.tipo === 'LIMITE_EXCEDIDO')
      
      expect(alertasLimite.length).toBeGreaterThan(0)
      expect(alertasLimite[0].valor).toBe(100000) // 10 x 10000
      expect(alertasLimite[0].gravidade).toBe('ALTA')
    })
  })

  describe('detectarFornecedoresSuspeitos', () => {
    it('deve detectar fornecedores que atendem poucos deputados', () => {
      const gastos: GastoParlamentar[] = [
        {
          txNomeParlamentar: 'Deputado A',
          cpf: '11111111111',
          ideCadastro: '001',
          nuCarteiraParlamentar: '123',
          nuLegislatura: 2023,
          sgUF: 'SP',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 1,
          txtDescricao: 'DIVULGAÇÃO',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Fornecedor Exclusivo LTDA',
          txtCNPJCPF: '99.999.999/0001-99',
          txtNumero: 1001,
          indTipoDocumento: 0,
          datEmissao: '2025-01-01',
          vlrDocumento: 50000,
          vlrGlosa: 0,
          vlrLiquido: 50000,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100001,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1001,
          ideDocumento: 2001,
          urlDocumento: 'https://exemplo.com/doc1.pdf'
        },
        {
          txNomeParlamentar: 'Deputado B',
          cpf: '22222222222',
          ideCadastro: '002',
          nuCarteiraParlamentar: '124',
          nuLegislatura: 2023,
          sgUF: 'RJ',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 1,
          txtDescricao: 'DIVULGAÇÃO',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Fornecedor Exclusivo LTDA',
          txtCNPJCPF: '99.999.999/0001-99',
          txtNumero: 1002,
          indTipoDocumento: 0,
          datEmissao: '2025-01-10',
          vlrDocumento: 60000,
          vlrGlosa: 0,
          vlrLiquido: 60000,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100002,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1002,
          ideDocumento: 2002,
          urlDocumento: 'https://exemplo.com/doc2.pdf'
        }
      ]

      const resultado = analisador.analisarGastos(gastos)
      const fornecedoresSuspeitos = resultado.fornecedoresSuspeitos.filter(
        f => f.cnpj === '99.999.999/0001-99'
      )
      
      expect(fornecedoresSuspeitos).toHaveLength(1)
      expect(fornecedoresSuspeitos[0].deputadosAtendidos).toBe(2)
      expect(fornecedoresSuspeitos[0].totalRecebido).toBe(110000)
      expect(fornecedoresSuspeitos[0].indiceSuspeicao).toBeGreaterThan(0)
    })
  })

  describe('calcularScoreSuspeicao', () => {
    it('deve calcular corretamente o score de suspeição', () => {
      const gastos: GastoParlamentar[] = [
        {
          txNomeParlamentar: 'Deputado Suspeito',
          cpf: '33333333333',
          ideCadastro: '003',
          nuCarteiraParlamentar: '125',
          nuLegislatura: 2023,
          sgUF: 'MG',
          sgPartido: 'SUS',
          codLegislatura: 57,
          numSubCota: 3,
          txtDescricao: 'COMBUSTÍVEIS E LUBRIFICANTES',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Posto Caro',
          txtCNPJCPF: '88.888.888/0001-88',
          txtNumero: 1001,
          indTipoDocumento: 0,
          datEmissao: '2025-01-01',
          vlrDocumento: 8500,
          vlrGlosa: 0,
          vlrLiquido: 8500,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100001,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1003,
          ideDocumento: 3001,
          urlDocumento: 'https://exemplo.com/doc1.pdf'
        }
      ]

      const resultado = analisador.analisarGastos(gastos)
      const deputadoAnalise = resultado.deputadosAnalise.find(
        d => d.nome === 'Deputado Suspeito'
      )
      
      expect(deputadoAnalise).toBeDefined()
      expect(deputadoAnalise!.scoreSuspeicao).toBeGreaterThan(0)
      expect(deputadoAnalise!.alertas.length).toBeGreaterThan(0)
    })
  })

  describe('estatísticas gerais', () => {
    it('deve calcular corretamente as estatísticas', () => {
      const gastos: GastoParlamentar[] = [
        {
          txNomeParlamentar: 'Deputado 1',
          cpf: '11111111111',
          ideCadastro: '001',
          nuCarteiraParlamentar: '123',
          nuLegislatura: 2023,
          sgUF: 'SP',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 1,
          txtDescricao: 'MANUTENÇÃO',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Fornecedor 1',
          txtCNPJCPF: '11.111.111/0001-11',
          txtNumero: 1001,
          indTipoDocumento: 0,
          datEmissao: '2025-01-01',
          vlrDocumento: 1000,
          vlrGlosa: 0,
          vlrLiquido: 1000,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100001,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1001,
          ideDocumento: 2001,
          urlDocumento: 'https://exemplo.com/doc1.pdf'
        },
        {
          txNomeParlamentar: 'Deputado 2',
          cpf: '22222222222',
          ideCadastro: '002',
          nuCarteiraParlamentar: '124',
          nuLegislatura: 2023,
          sgUF: 'RJ',
          sgPartido: 'TESTE',
          codLegislatura: 57,
          numSubCota: 1,
          txtDescricao: 'MANUTENÇÃO',
          numEspecificacaoSubCota: 0,
          txtDescricaoEspecificacao: null,
          txtFornecedor: 'Fornecedor 2',
          txtCNPJCPF: '22.222.222/0001-22',
          txtNumero: 1002,
          indTipoDocumento: 0,
          datEmissao: '2025-01-02',
          vlrDocumento: 2000,
          vlrGlosa: 0,
          vlrLiquido: 2000,
          numMes: 1,
          numAno: 2025,
          numParcela: 0,
          txtPassageiro: null,
          txtTrecho: null,
          numLote: 100002,
          numRessarcimento: null,
          datPagamentoRestituicao: null,
          vlrRestituicao: null,
          nuDeputadoId: 1002,
          ideDocumento: 2002,
          urlDocumento: 'https://exemplo.com/doc2.pdf'
        }
      ]

      const resultado = analisador.analisarGastos(gastos)
      
      expect(resultado.estatisticas.totalGasto).toBe(3000)
      expect(resultado.estatisticas.totalRegistros).toBe(2)
      expect(resultado.estatisticas.numDeputados).toBe(2)
      expect(resultado.estatisticas.numFornecedores).toBe(2)
      expect(resultado.estatisticas.mediaGastoPorDeputado).toBe(1500)
    })
  })
})
