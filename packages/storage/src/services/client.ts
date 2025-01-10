import type { Readable } from 'stream';

export type Content = string | Uint8Array | Buffer | Readable;

export type SignReadOptions = SignOptions;

export type SignWriteOptions = SignOptions & WriteOptions;

export type SignOptions = {
  /**
   * Define an expiration time (in seconds) for the signed URL.
   */
  expiresIn: number;
};

export type WriteOptions = {
  /**
   * Define the expected content type.
   */
  contentType: string;
};

export type ObjectStats = {
  /**
   * MIME type associated to the object.
   */
  type?: string;

  /**
   * Object size.
   */
  size: number;
};

/**
 * Bucket client.
 */
export interface Client {
  /**
   * Check whether the given object exists or not in the bucket.
   *
   * @param key Object key.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Write an object into the bucket.
   *
   * @param key Object key.
   * @param content Object contents.
   * @param options Write options.
   */
  write(key: string, content: Content, options?: WriteOptions): Promise<void>;

  /**
   * Read an object from the bucket.
   *
   * @param key Object key.
   * @returns Returns a buffer corresponding to the object contents.
   */
  read(key: string): Promise<Buffer>;

  /**
   * Delete the given object from the bucket.
   *
   * @param key Object key.
   */
  delete(key: string): Promise<void>;

  /**
   * Get an URL to write the specified object into the bucket.
   * @param key Object key.
   * @param options Sign options.
   */
  getWriteUrl(key: string, options: SignWriteOptions): Promise<string>;

  /**
   * Get an URL to read the specified object from the bucket.
   * @param key Object key.
   * @param options Sign options.
   */
  getReadUrl(key: string, options: SignReadOptions): Promise<string>;

  /**
   * Get the stats from the given object.
   * @param key Object key.
   * @returns Returns the corresponding object stats or undefined when the given object doesn't exists.
   */
  getStats(key: string): Promise<ObjectStats | undefined>;
}
