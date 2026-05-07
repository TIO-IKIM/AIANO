/**
 * LRU (Least Recently Used) Cache Manager
 *
 * Implements cache size limits with LRU eviction policy to prevent
 * localStorage/IndexedDB from growing unbounded.
 *
 * How LRU Works:
 * - When cache is full, remove the least recently used item
 * - Track access order (most recent = highest priority)
 * - Automatically evict old entries when limit is reached
 *
 * Benefits:
 * - Prevents quota exceeded errors
 * - Keeps most relevant data in cache
 * - Automatic cleanup of unused data
 */

interface CacheMetadata {
  key: string;
  lastAccessed: number;
  size: number; // Approximate size in bytes
  projectId?: string;
}

interface LRUCacheConfig {
  maxProjects: number; // Maximum number of projects to cache
  maxSize: number; // Maximum total cache size in bytes (optional)
  defaultTTL: number; // Default time-to-live in milliseconds
}

class LRUCacheManager {
  private metadataKey = 'lru_cache_metadata';

  private config: LRUCacheConfig;

  constructor(config: Partial<LRUCacheConfig> = {}) {
    this.config = {
      maxProjects: config.maxProjects || 10, // Cache up to 10 projects
      maxSize: config.maxSize || 50 * 1024 * 1024, // 50MB default
      defaultTTL: config.defaultTTL || 30 * 60 * 1000, // 30 minutes
    };
  }

  /**
   * Get all cache metadata
   */
  private getMetadata(): CacheMetadata[] {
    try {
      const stored = localStorage.getItem(this.metadataKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save cache metadata
   */
  private saveMetadata(metadata: CacheMetadata[]): void {
    try {
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save LRU cache metadata:', error);
    }
  }

  /**
   * Update access time for a cache entry
   */
  updateAccess(key: string, projectId?: string, size?: number): void {
    const metadata = this.getMetadata();
    const now = Date.now();

    // Find existing entry
    let entry = metadata.find((m) => m.key === key);

    if (entry) {
      // Update access time
      entry.lastAccessed = now;
      if (size !== undefined) entry.size = size;
    } else {
      // Create new entry
      entry = {
        key,
        lastAccessed: now,
        size: size || 0,
        projectId,
      };
      metadata.push(entry);
    }

    // Sort by last accessed (most recent first)
    metadata.sort((a, b) => b.lastAccessed - a.lastAccessed);

    // Enforce limits
    this.enforceLimits(metadata);

    this.saveMetadata(metadata);
  }

  /**
   * Enforce cache size limits using LRU eviction
   */
  private enforceLimits(metadata: CacheMetadata[]): void {
    // Group by project
    const projects = new Map<string, CacheMetadata[]>();
    metadata.forEach((entry) => {
      if (entry.projectId) {
        if (!projects.has(entry.projectId)) {
          projects.set(entry.projectId, []);
        }
        projects.get(entry.projectId)!.push(entry);
      }
    });

    // If we have too many projects, remove least recently used ones
    if (projects.size > this.config.maxProjects) {
      // Sort projects by most recent access
      const projectAccess = Array.from(projects.entries()).map(
        ([projectId, entries]) => ({
          projectId,
          lastAccessed: Math.max(...entries.map((e) => e.lastAccessed)),
        })
      );

      projectAccess.sort((a, b) => b.lastAccessed - a.lastAccessed);

      // Remove least recently used projects
      const toRemove = projectAccess.slice(this.config.maxProjects);
      toRemove.forEach(({ projectId }) => {
        const entries = projects.get(projectId)!;
        entries.forEach((entry) => {
          // Remove from localStorage
          try {
            localStorage.removeItem(entry.key);
          } catch (error) {
            console.warn(`Failed to remove cache entry ${entry.key}:`, error);
          }

          // Remove from metadata
          const index = metadata.findIndex((m) => m.key === entry.key);
          if (index !== -1) {
            metadata.splice(index, 1);
          }
        });
        projects.delete(projectId);
      });
    }

    // Enforce total size limit (optional)
    if (this.config.maxSize) {
      let totalSize = metadata.reduce((sum, entry) => sum + entry.size, 0);

      // Remove oldest entries until under limit
      while (totalSize > this.config.maxSize && metadata.length > 0) {
        // Sort by last accessed (oldest first)
        metadata.sort((a, b) => a.lastAccessed - b.lastAccessed);

        const oldest = metadata.shift()!;
        totalSize -= oldest.size;

        // Remove from localStorage
        try {
          localStorage.removeItem(oldest.key);
        } catch (error) {
          console.warn(`Failed to remove cache entry ${oldest.key}:`, error);
        }
      }

      // Re-sort by last accessed (most recent first)
      metadata.sort((a, b) => b.lastAccessed - a.lastAccessed);
    }
  }

  /**
   * Remove a cache entry
   */
  remove(key: string): void {
    const metadata = this.getMetadata();
    const index = metadata.findIndex((m) => m.key === key);
    if (index !== -1) {
      metadata.splice(index, 1);
      this.saveMetadata(metadata);
    }
  }

  /**
   * Clear all cache metadata
   */
  clear(): void {
    const metadata = this.getMetadata();
    metadata.forEach((entry) => {
      try {
        localStorage.removeItem(entry.key);
      } catch (error) {
        console.warn(`Failed to remove cache entry ${entry.key}:`, error);
      }
    });
    localStorage.removeItem(this.metadataKey);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    projectCount: number;
    totalEntries: number;
    totalSize: number;
    oldestAccess: number | null;
    newestAccess: number | null;
  } {
    const metadata = this.getMetadata();
    const projects = new Set(metadata.map((m) => m.projectId).filter(Boolean));

    const accessTimes = metadata.map((m) => m.lastAccessed).filter(Boolean);

    return {
      projectCount: projects.size,
      totalEntries: metadata.length,
      totalSize: metadata.reduce((sum, entry) => sum + entry.size, 0),
      oldestAccess: accessTimes.length > 0 ? Math.min(...accessTimes) : null,
      newestAccess: accessTimes.length > 0 ? Math.max(...accessTimes) : null,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(ttl: number = this.config.defaultTTL): number {
    const metadata = this.getMetadata();
    const now = Date.now();
    let cleaned = 0;

    const toRemove: string[] = [];

    metadata.forEach((entry) => {
      if (now - entry.lastAccessed > ttl) {
        toRemove.push(entry.key);
      }
    });

    toRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
        cleaned++;
      } catch (error) {
        console.warn(`Failed to remove expired cache entry ${key}:`, error);
      }
    });

    // Update metadata
    const remaining = metadata.filter((entry) => !toRemove.includes(entry.key));
    this.saveMetadata(remaining);

    return cleaned;
  }
}

// Export singleton instance with default config
export const lruCache = new LRUCacheManager({
  maxProjects: 10, // Cache up to 10 projects
  maxSize: 50 * 1024 * 1024, // 50MB total cache size
  defaultTTL: 30 * 60 * 1000, // 30 minutes
});
