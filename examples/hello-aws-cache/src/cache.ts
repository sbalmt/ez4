import type { Cache } from '@ez4/cache';

/**
 * Example of AWS ElastiCache deployed with EZ4.
 */
export declare class CacheService extends Cache.Service {
  /**
   * Specify which engine to use.
   */
  engine: Cache.UseEngine<{
    name: 'valkey';
  }>;
}
