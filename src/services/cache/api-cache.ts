/**
 * Sistema de Cache Inteligente para API da Câmara
 * 
 * Este serviço implementa um cache inteligente que:
 * - Armazena dados da API localmente
 * - Evita downloads desnecessários
 * - Permite busca incremental
 * - Gerencia expiração de dados
 */

import { GastoParlamentar } from '@/types/gastos'

interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
  etag?: string
  checksum?: string
}

interface CacheMetadata {
  deputadoId: number
  ano: number
  mes: number
  totalRegistros: number
  ultimaAtualizacao: string
}

export class ApiCacheService {
  private readonly CACHE_PREFIX = 'api_cache_'
  private readonly METADATA_KEY = 'api_cache_metadata'
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 horas
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB

  /**
   * Salva dados no cache
   */
  async setCache(
    key: string,
    data: any,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        checksum: this.generateChecksum(data)
      }

      const serialized = JSON.stringify(entry)
      
      // Verificar tamanho antes de salvar
      if (serialized.length > this.MAX_CACHE_SIZE) {
        console.warn('Cache entry too large, skipping:', key)
        return
      }

      localStorage.setItem(this.CACHE_PREFIX + key, serialized)
      this.updateMetadata(key, data)
    } catch (error) {
      console.error('Error saving to cache:', error)
      this.cleanupCache() // Limpar cache se houver erro de espaço
    }
  }

  /**
   * Recupera dados do cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key)
      if (!cached) return null

      const entry: CacheEntry = JSON.parse(cached)

      // Verificar se expirou
      if (Date.now() > entry.expiresAt) {
        this.removeCache(key)
        return null
      }

      return entry.data as T
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }

  /**
   * Verifica se existe cache válido para deputado/período
   */
  async hasValidCache(
    deputadoId: number,
    ano: number,
    mes: number
  ): Promise<boolean> {
    const key = this.generateKey('despesas', deputadoId, ano, mes)
    const cached = await this.getCache(key)
    return cached !== null
  }

  /**
   * Cache inteligente para despesas de deputado
   */
  async getCachedDespesas(
    deputadoId: number,
    ano: number,
    mes: number
  ): Promise<any[] | null> {
    const key = this.generateKey('despesas', deputadoId, ano, mes)
    return this.getCache<any[]>(key)
  }

  /**
   * Salva despesas no cache
   */
  async setCachedDespesas(
    deputadoId: number,
    ano: number,
    mes: number,
    despesas: any[]
  ): Promise<void> {
    const key = this.generateKey('despesas', deputadoId, ano, mes)
    await this.setCache(key, despesas)
  }

  /**
   * Cache para lista de deputados (maior TTL)
   */
  async getCachedDeputados(legislatura?: number): Promise<any[] | null> {
    const key = this.generateKey('deputados', legislatura || 'atual')
    return this.getCache<any[]>(key)
  }

  async setCachedDeputados(deputados: any[], legislatura?: number): Promise<void> {
    const key = this.generateKey('deputados', legislatura || 'atual')
    await this.setCache(key, deputados, 7 * 24 * 60 * 60 * 1000) // 7 dias
  }

  /**
   * Busca incremental - retorna apenas IDs de deputados sem cache
   */
  async getDeputadosSemCache(
    deputadosIds: number[],
    ano: number,
    mes: number
  ): Promise<number[]> {
    const semCache: number[] = []

    for (const id of deputadosIds) {
      const hasCache = await this.hasValidCache(id, ano, mes)
      if (!hasCache) {
        semCache.push(id)
      }
    }

    return semCache
  }

  /**
   * Estatísticas do cache
   */
  getCacheStats(): {
    totalEntries: number
    totalSize: number
    oldestEntry: Date | null
    newestEntry: Date | null
  } {
    let totalEntries = 0
    let totalSize = 0
    let oldestTimestamp = Infinity
    let newestTimestamp = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_PREFIX)) {
        totalEntries++
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length
          
          try {
            const entry: CacheEntry = JSON.parse(value)
            oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp)
            newestTimestamp = Math.max(newestTimestamp, entry.timestamp)
          } catch {}
        }
      }
    }

    return {
      totalEntries,
      totalSize,
      oldestEntry: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
      newestEntry: newestTimestamp === 0 ? null : new Date(newestTimestamp)
    }
  }

  /**
   * Limpa cache expirado
   */
  cleanupCache(): number {
    let removedCount = 0
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_PREFIX)) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            const entry: CacheEntry = JSON.parse(value)
            if (now > entry.expiresAt) {
              keysToRemove.push(key)
            }
          }
        } catch {
          keysToRemove.push(key) // Remove entradas corrompidas
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      removedCount++
    })

    return removedCount
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache(): void {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  /**
   * Remove entrada específica do cache
   */
  private removeCache(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key)
    this.removeFromMetadata(key)
  }

  /**
   * Gera chave única para cache
   */
  private generateKey(...parts: any[]): string {
    return parts.join('_')
  }

  /**
   * Gera checksum simples para validação
   */
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(16)
  }

  /**
   * Atualiza metadados do cache
   */
  private updateMetadata(key: string, data: any): void {
    try {
      const metadata = this.getMetadata()
      metadata[key] = {
        timestamp: Date.now(),
        size: JSON.stringify(data).length,
        type: Array.isArray(data) ? 'array' : typeof data
      }
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.error('Error updating cache metadata:', error)
    }
  }

  /**
   * Remove dos metadados
   */
  private removeFromMetadata(key: string): void {
    try {
      const metadata = this.getMetadata()
      delete metadata[key]
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.error('Error removing from metadata:', error)
    }
  }

  /**
   * Recupera metadados
   */
  private getMetadata(): Record<string, any> {
    try {
      const metadata = localStorage.getItem(this.METADATA_KEY)
      return metadata ? JSON.parse(metadata) : {}
    } catch {
      return {}
    }
  }

  /**
   * Exporta cache para backup
   */
  exportCache(): string {
    const cacheData: Record<string, any> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          cacheData[key] = JSON.parse(value)
        }
      }
    }

    return JSON.stringify(cacheData, null, 2)
  }

  /**
   * Importa cache de backup
   */
  importCache(jsonData: string): boolean {
    try {
      const cacheData = JSON.parse(jsonData)
      
      Object.entries(cacheData).forEach(([key, value]) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.setItem(key, JSON.stringify(value))
        }
      })

      return true
    } catch (error) {
      console.error('Error importing cache:', error)
      return false
    }
  }
}

// Instância singleton
export const apiCache = new ApiCacheService()

// Hook para React
export function useApiCache() {
  return {
    hasCache: apiCache.hasValidCache.bind(apiCache),
    getCachedDespesas: apiCache.getCachedDespesas.bind(apiCache),
    setCachedDespesas: apiCache.setCachedDespesas.bind(apiCache),
    getCachedDeputados: apiCache.getCachedDeputados.bind(apiCache),
    setCachedDeputados: apiCache.setCachedDeputados.bind(apiCache),
    getDeputadosSemCache: apiCache.getDeputadosSemCache.bind(apiCache),
    getCacheStats: apiCache.getCacheStats.bind(apiCache),
    cleanupCache: apiCache.cleanupCache.bind(apiCache),
    clearCache: apiCache.clearAllCache.bind(apiCache)
  }
}
