import type { Cache } from '@ez4/cache';

/**
 * Internal cache description.
 *
 * @description Test cache service.
 */
export declare class TestCache extends Cache.Service {
  /**
   * Specify the cache engine.
   */
  engine: Cache.UseEngine<{
    name: 'test';
  }>;
}
