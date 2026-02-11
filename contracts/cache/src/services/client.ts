/**
 * Cache client.
 */
export interface Client {
  /**
   * Get the value corresponding to the given key.
   *
   * @param key Key name.
   * @return Returns the corresponding key value or `undefined`.
   */
  get(key: string): Promise<string | undefined>;

  /**
   * Set the given value into the given key.
   *
   * @param key Key name.
   * @param value Key value.
   * @param options Options when setting the key.
   */
  set(key: string, value: string, options?: SetOptions): Promise<void>;

  /**
   * Set the expiration TTL for the given key.
   *
   * @param key Key name.
   * @param ttl TTL for the key.
   * @returns Returns the `true` when the TTL is applied, `false` otherwise.
   */
  expire(key: string, ttl: number): Promise<boolean>;

  /**
   * Delete all the given keys.
   *
   * @param keys Key names.
   * @returns Returns the number of deleted keys.
   */
  delete(...keys: string[]): Promise<number>;

  /**
   * Determines whether the given keys exists.
   *
   * @param keys Key names.
   * @returns Returns the number of existing keys.
   */
  exists(...keys: string[]): Promise<number>;
}

/**
 * Options for setting keys.
 */
export type SetOptions = {
  /**
   * TTL for the key.
   */
  ttl?: number;
};
