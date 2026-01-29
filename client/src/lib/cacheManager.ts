import { LRUCache } from "lru-cache";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CodeGenerationCache {
  private cache: LRUCache<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache({
      max: maxSize,
      maxSize: maxSize * 1024 * 100, // Approximate size limit
    });
  }

  /**
   * Generate a cache key from description and style
   */
  private generateKey(description: string, style: string): string {
    return `${style}:${Buffer.from(description).toString("base64")}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  /**
   * Get cached code generation result
   */
  get<T>(description: string, style: string): T | null {
    const key = this.generateKey(description, style);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(
    description: string,
    style: string,
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(description, style);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.maxSize,
    };
  }
}

// Global cache instance
export const codeGenerationCache = new CodeGenerationCache(100);

/**
 * Cache decorator for async functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Check cache first
    const cached = codeGenerationCache.cache.get(key);
    if (cached && codeGenerationCache["isValid"](cached)) {
      return cached.data;
    }

    // Execute function
    const result = await fn(...args);

    // Store in cache
    codeGenerationCache.cache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl: ttl || 3600000,
    });

    return result;
  }) as T;
}
