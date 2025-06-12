// Script de teste para verificar a integração com o Firestore
// Executar no console do navegador após abrir a aplicação

console.log('🔥 Testando Integração com Firestore...\n');

// Teste 1: Verificar se o Firebase está inicializado
try {
  const firebase = window.firebase;
  if (firebase) {
    console.log('✅ Firebase inicializado corretamente');
  } else {
    console.error('❌ Firebase não encontrado no window');
  }
} catch (e) {
  console.error('❌ Erro ao verificar Firebase:', e);
}

// Teste 2: Verificar localStorage
console.log('\n📦 Verificando localStorage:');
const ultimaAnalise = localStorage.getItem('ultima-analise');
const fonteDados = localStorage.getItem('fonte-dados');
const firestoreFilters = localStorage.getItem('firestore-filters');

console.log('- ultima-analise:', ultimaAnalise ? '✅ Presente' : '❌ Ausente');
console.log('- fonte-dados:', fonteDados || 'Não definido');
console.log('- firestore-filters:', firestoreFilters || 'Não definido');

// Teste 3: Testar busca manual do Firestore
console.log('\n🔍 Testando busca manual:');

import('@/services/firestore-service').then(({ firestoreService }) => {
  // Teste buscar deputados
  console.log('Buscando deputados...');
  firestoreService.buscarDeputados({ limite: 5 })
    .then(deputados => {
      console.log(`✅ ${deputados.length} deputados encontrados`);
      if (deputados.length > 0) {
        console.log('Exemplo:', deputados[0]);
      }
    })
    .catch(err => {
      console.error('❌ Erro ao buscar deputados:', err);
    });

  // Teste buscar dados completos
  console.log('\nBuscando dados completos...');
  firestoreService.buscarDadosCompletos({
    ano: 2024,
    mes: 'todos',
    limite: 10
  })
    .then(dados => {
      console.log('✅ Dados completos carregados');
      console.log('- Deputados analisados:', dados.analise.deputadosAnalise.length);
      console.log('- Total de alertas:', dados.analise.alertas.length);
      console.log('- Total gasto:', dados.analise.estatisticas.totalGasto);
    })
    .catch(err => {
      console.error('❌ Erro ao buscar dados completos:', err);
    });
});

// Teste 4: Verificar Context
console.log('\n🎯 Para testar o Context, execute no componente React:');
console.log(`
import { useFirestore } from '@/contexts/FirestoreContext';

const Component = () => {
  const { data, loading, error, isConnected } = useFirestore();
  console.log({ data, loading, error, isConnected });
};
`);

// Teste 5: Sugestões de debug
console.log('\n🛠️ Sugestões de Debug:');
console.log('1. Verificar aba Network para requisições ao Firestore');
console.log('2. Verificar Console do Firebase para logs de acesso');
console.log('3. Testar com diferentes filtros (ano, mês, UF)');
console.log('4. Verificar se as credenciais estão corretas em firebase.ts');

// Função helper para testar manualmente
window.testarFirestore = async (opcoes = {}) => {
  const { firestoreService } = await import('@/services/firestore-service');
  
  console.log('Testando com opções:', opcoes);
  try {
    const resultado = await firestoreService.buscarDadosCompletos(opcoes);
    console.log('✅ Sucesso!', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro:', erro);
    throw erro;
  }
};

console.log('\n💡 Use window.testarFirestore() para testar manualmente');
console.log('Exemplo: window.testarFirestore({ ano: 2024, mes: 12, uf: "SP" })');
