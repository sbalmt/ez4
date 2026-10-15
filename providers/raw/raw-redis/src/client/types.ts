/**
 * Cache engine for raw-redis.
 *
 * Targets any Redis-compatible server (Redis, Valkey, KeyDB, Dragonfly) through the Redis
 * protocol, or through a Redis REST API. The connection is supplied at runtime via
 * `localOptions.<service>` (dev/emulator) or env vars (prod).
 */
export type RedisEngine = {
  name: 'raw-redis';
};

export type ClientConnection = {
  /**
   * Server URL, the scheme selects the driver:
   * - `redis://` or `rediss://` (TLS) uses the Redis protocol over TCP.
   * - `https://` (or `http://` for local proxies) uses the Redis REST API.
   */
  url: string;

  /**
   * Bearer token, required by the Redis REST API.
   */
  token?: string;
};

export type ClientContext = {
  /**
   * Identifier used to reuse the same connection across clients.
   */
  identifier: string;

  /**
   * Prefix prepended to all keys, isolating services that share the same server.
   */
  prefix: string;

  /**
   * Connection settings.
   */
  connection: ClientConnection;

  /**
   * Determines whether debug messages are enabled.
   */
  debug?: boolean;
};
