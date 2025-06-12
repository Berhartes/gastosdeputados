# 🔥 Integração Completa com Firestore - Guia de Implementação

## ✅ Status da Implementação

### Componentes Criados:
1. **`useFirestoreData` Hook** (`src/hooks/use-firestore-data.ts`)
   - Hook principal para buscar dados do Firestore
   - Suporta cache local como fallback
   - Inclui hooks especializados para deputados e ranking

2. **`FirestoreContext`** (`src/contexts/FirestoreContext.tsx`)
   - Context API para estado global
   - Gerencia filtros e sincronização
   - Hooks auxiliares: `useDeputadosFirestore`, `useAlertasFirestore`, `useEstatisticasFirestore`

3. **`FirestoreStatus`** (`src/components/FirestoreStatus.tsx`)
   - Componente para exibir status de conexão
   - Estados de loading e erro
   - Indicadores de sincronização

### Páginas Atualizadas:
- ✅ **App.tsx** - Envolvido com `FirestoreProvider`
- ✅ **ListaDeputados** - Integrado com Firestore
- ✅ **AlertasPage** - Integrado com Firestore
- ✅ **Dashboard** - Já tinha integração (FirestoreDataFetcher e RankingFirestore)

### Páginas Pendentes:
- ⏳ **PerfilDeputado** 
- ⏳ **RelatoriosPage**
- ⏳ **CompararDeputados**
- ⏳ **AnaliseAvancadaPage**
- ⏳ **FornecedoresPage**

## 🚀 Como Usar

### 1. Em Qualquer Página/Componente:

```typescript
import { useFirestore, useDeputadosFirestore } from '@/contexts/FirestoreContext';
import { FirestoreStatus } from '@/components/FirestoreStatus';

export function MinhaPage() {
  // Opção 1: Dados completos
  const { data, loading, error, refetch, isConnected } = useFirestore();
  
  // Opção 2: Apenas deputados
  const { deputados, loading, error } = useDeputadosFirestore();
  
  return (
    <div>
      <FirestoreStatus loading={loading} error={error} onRetry={refetch} />
      
      {/* Seu conteúdo */}
    </div>
  );
}
```

### 2. Aplicar Filtros Globais:

```typescript
const { filters, setFilters } = useFirestore();

// Atualizar filtros
setFilters({
  ano: 2024,
  mes: 12,
  uf: 'SP',
  partido: 'PT'
});
```

### 3. Buscar Dados Específicos:

```typescript
import { useFirestoreData } from '@/hooks/use-firestore-data';

// Hook com opções específicas
const { data, loading, error, refetch } = useFirestoreData({
  ano: 2024,
  mes: 'todos',
  uf: 'RJ',
  autoLoad: true // false para controle manual
});
```

## 📝 Próximos Passos para Completar a Integração

### 1. Atualizar PerfilDeputado:

```typescript
// src/pages/PerfilDeputado.tsx
import { useDeputadoFirestore } from '@/hooks/use-firestore-data';

export function PerfilDeputado({ deputado }: Props) {
  const { deputado: deputadoCompleto, loading, error } = useDeputadoFirestore(deputado?.id);
  
  // Usar deputadoCompleto que inclui despesas detalhadas
}
```

### 2. Atualizar RelatoriosPage:

```typescript
// src/pages/RelatoriosPage.tsx
import { useFirestore, useEstatisticasFirestore } from '@/contexts/FirestoreContext';

export function RelatoriosPage() {
  const { estatisticas, loading, error } = useEstatisticasFirestore();
  const { filters, setFilters } = useFirestore();
  
  // Gerar relatórios baseados em estatisticas
}
```

### 3. Atualizar CompararDeputados:

```typescript
// src/pages/CompararDeputados.tsx
import { useDeputadosFirestore } from '@/contexts/FirestoreContext';

export function CompararDeputados() {
  const { deputados, loading } = useDeputadosFirestore();
  
  // Permitir seleção múltipla de deputados para comparação
}
```

### 4. Implementar Busca Global:

```typescript
// src/components/BuscaGlobal.tsx
import { firestoreService } from '@/services/firestore-service';

// Adicionar busca em tempo real
const buscarNoFirestore = async (termo: string) => {
  const deputados = await firestoreService.buscarDeputados();
  return deputados.filter(d => 
    d.nome?.toLowerCase().includes(termo.toLowerCase())
  );
};
```

## 🔧 Configurações Importantes

### 1. Verificar Credenciais Firebase:
Certifique-se de que o arquivo `src/services/firebase.ts` tem as credenciais corretas:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "a-republica-brasileira.firebaseapp.com",
  projectId: "a-republica-brasileira",
  // ... outras configs
};
```

### 2. Estrutura do Firestore:
O sistema espera a seguinte estrutura no banco:

```
congressoNacional/
├── camaraDeputados/
│   ├── legislatura/57/deputados/{id}
│   └── perfilComplementar/{id}/despesas/{ano}/{mes}/all_despesas
```

### 3. Performance:
- Os dados são automaticamente salvos no localStorage
- Use filtros para limitar a quantidade de dados
- Implemente paginação para listas grandes

## 🐛 Troubleshooting

### Erro de Conexão:
- Verifique as credenciais do Firebase
- Confirme permissões no Firestore Console
- O sistema usa cache local automaticamente

### Dados não Aparecem:
- Verifique a estrutura dos dados no Firestore
- Use o console do navegador para debug
- Confirme que existe dados para o período selecionado

### Performance Lenta:
- Use filtros específicos (UF, partido)
- Implemente limite de deputados
- Considere usar paginação

## 📊 Monitoramento

Para monitorar o uso do Firestore:

1. Acesse o Console do Firebase
2. Vá para Firestore > Uso
3. Monitore leituras/escritas
4. Configure alertas de cota

## 🎯 Benefícios da Integração

1. **Dados em Tempo Real**: Sempre atualizados
2. **Modo Offline**: Cache automático
3. **Filtros Globais**: Estado compartilhado
4. **Performance**: Otimizado com cache
5. **Escalabilidade**: Pronto para crescer

---

**Versão**: 2.0.0  
**Data**: 12/06/2025  
**Status**: 🟢 Parcialmente Implementado
