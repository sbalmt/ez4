import type { Cache } from '@ez4/cache';

/**
 * First test cache.
 */
export declare class TestCache extends Cache.Service {
  /**
   * Specify the cache engine.
   */
  engine: Cache.UseEngine<{
    name: 'test';
  }>;
}
