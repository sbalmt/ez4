/**
 * Cache client.
 */
export interface Client {
  /**
   * Clear the entire cache removing all its keys.
   */
  flush(): Promise<void>;

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
   * @param ttl TTL for the key (in seconds).
   * @returns Returns the `true` when the TTL is applied, `false` otherwise.
   */
  setTTL(key: string, ttl: number): Promise<boolean>;

  /**
   * Get the current TTL for the given key.
   *
   * @param key Key name.
   * @returns Returns the current TTL or `undefined` when there's none.
   */
  getTTL(key: string): Promise<number | undefined>;

  /**
   * Rename the given key.
   *
   * @param key Key name.
   * @param newkey New key name.
   * @returns Returns `true` when the key is renamed, `false` otherwise.
   */
  rename(key: string, newkey: string): Promise<boolean>;

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

  /**
   * Increment the current value for the given key.
   *
   * @param key Key name.
   * @param value Optional increment value. (Default is `1`)
   * @returns Returns the final value.
   */
  increment(key: string, value?: number): Promise<number>;

  /**
   * Decrement the current value for the given key.
   *
   * @param key Key name.
   * @param value Optional decrement value. (Default is `1`)
   * @returns Returns the final value.
   */
  decrement(key: string, value?: number): Promise<number>;
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
