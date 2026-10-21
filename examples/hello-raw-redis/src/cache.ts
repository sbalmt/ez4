import type { RedisEngine } from '@ez4/raw-redis/client';
import type { Cache } from '@ez4/cache';

/**
 * Example of an external Redis (managed or self-hosted) used with EZ4.
 *
 * Dev uses `localOptions.cache_service`; prod uses the env vars
 * `EZ4_RAW_REDIS_CACHE_SERVICE_URL` and `EZ4_RAW_REDIS_CACHE_SERVICE_TOKEN` (REST only)
 * propagated to the Lambda runtime.
 */
export declare class CacheService extends Cache.Service {
  /**
   * Specify which engine to use.
   */
  engine: RedisEngine;
}
