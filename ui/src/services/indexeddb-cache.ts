/**
 * IndexedDB Cache Service
 *
 * Provides a high-capacity storage solution for documents and annotations
 * that exceeds localStorage's 5-10MB limit.
 *
 * Storage Limits:
 * - localStorage: ~5-10MB per origin
 * - IndexedDB: ~50% of disk space (typically 1GB+)
 *
 * Benefits:
 * - Store large document sets without quota issues
 * - Async operations (non-blocking)
 * - Structured storage with indexes
 * - Better performance for large data
 */

const DB_NAME = 'aiano-cache';
const DB_VERSION = 1;

// Store names
const STORES = {
  DOCUMENTS: 'documents',
  ANNOTATIONS: 'annotations',
  METADATA: 'metadata',
} as const;

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;

  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create documents store
        if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
          const documentsStore = db.createObjectStore(STORES.DOCUMENTS, {
            keyPath: 'key',
          });
          documentsStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
          documentsStore.createIndex('expiresAt', 'expiresAt', {
            unique: false,
          });
        }

        // Create annotations store
        if (!db.objectStoreNames.contains(STORES.ANNOTATIONS)) {
          const annotationsStore = db.createObjectStore(STORES.ANNOTATIONS, {
            keyPath: 'key',
          });
          annotationsStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
        }

        // Create metadata store (for cache management)
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store documents in IndexedDB
   */
  async setDocuments(
    projectId: string,
    documents: any[],
    ttl?: number
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = `documents_${projectId}`;
    const now = Date.now();
    const entry: CacheEntry<any[]> = {
      key,
      data: documents,
      timestamp: now,
      expiresAt: ttl ? now + ttl : undefined,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DOCUMENTS], 'readwrite');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve documents from IndexedDB
   */
  async getDocuments(projectId: string): Promise<any[] | null> {
    await this.init();
    if (!this.db) return null;

    const key = `documents_${projectId}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DOCUMENTS], 'readonly');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<any[]> | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiration
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          // Expired, delete and return null
          this.deleteDocuments(projectId);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store annotations in IndexedDB
   */
  async setAnnotations(fileId: string, annotations: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = `annotation_${fileId}`;
    const entry: CacheEntry<any> = {
      key,
      data: annotations,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.ANNOTATIONS],
        'readwrite'
      );
      const store = transaction.objectStore(STORES.ANNOTATIONS);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve annotations from IndexedDB
   */
  async getAnnotations(fileId: string): Promise<any | null> {
    await this.init();
    if (!this.db) return null;

    const key = `annotation_${fileId}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.ANNOTATIONS],
        'readonly'
      );
      const store = transaction.objectStore(STORES.ANNOTATIONS);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<any> | undefined = request.result;
        resolve(entry?.data || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete documents cache
   */
  async deleteDocuments(projectId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = `documents_${projectId}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DOCUMENTS], 'readwrite');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    let cleared = 0;
    const now = Date.now();

    // Clear expired documents
    const documentsTransaction = this.db.transaction(
      [STORES.DOCUMENTS],
      'readwrite'
    );
    const documentsStore = documentsTransaction.objectStore(STORES.DOCUMENTS);
    const documentsIndex = documentsStore.index('expiresAt');
    const documentsRange = IDBKeyRange.upperBound(now);

    return new Promise((resolve) => {
      documentsIndex.openCursor(documentsRange).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cleared++;
          cursor.continue();
        } else {
          resolve(cleared);
        }
      };
    });
  }

  /**
   * Get cache size estimate (approximate)
   */
  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    // Note: IndexedDB doesn't provide direct size API
    // This is an approximation based on entry count
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(
        [STORES.DOCUMENTS, STORES.ANNOTATIONS],
        'readonly'
      );
      let count = 0;

      const countStore = (storeName: string) => {
        const store = transaction.objectStore(storeName);
        const request = store.count();
        request.onsuccess = () => {
          count += request.result;
          if (storeName === STORES.ANNOTATIONS) {
            resolve(count);
          }
        };
      };

      countStore(STORES.DOCUMENTS);
      countStore(STORES.ANNOTATIONS);
    });
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.DOCUMENTS, STORES.ANNOTATIONS, STORES.METADATA],
        'readwrite'
      );

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      transaction.objectStore(STORES.DOCUMENTS).clear();
      transaction.objectStore(STORES.ANNOTATIONS).clear();
      transaction.objectStore(STORES.METADATA).clear();
    });
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
