import type { Readable } from 'stream';

export type Content = string | Uint8Array | Buffer | Readable;

export type SignReadOptions = {
  /**
   * Define an expiration time (in seconds) for the signed URL.
   */
  readonly expiresIn: number;
};

export type SignWriteOptions = SignReadOptions & {
  /**
   * Define the expected content type for the signed URL.
   */
  readonly contentType: string;

  /**
   * Define the expected custom metadata for the signed URL.
   */
  readonly metadata?: Record<string, string>;

  /**
   * Define the expected headers for the signed URL.
   */
  readonly headers?: ObjectHeaders;
};

export type WriteOptions = {
  /**
   * Specify the content type for the object.
   */
  readonly contentType?: string;

  /**
   * Specify the custom metadata for the object.
   */
  readonly metadata?: Record<string, string>;

  /**
   * Specify the headers for the object.
   */
  readonly headers?: ObjectHeaders;
};

export type ObjectHeaders = {
  /**
   * Cache control header for the object.
   */
  cacheControl?: string;

  /**
   * Expires header for the object.
   */
  expires?: Date;
};

export type ObjectStats = {
  /**
   * MIME type associated to the object.
   */
  readonly type: string;

  /**
   * Custom metadata associated to the object.
   */
  readonly metadata?: Record<string, string>;

  /**
   * Object size.
   */
  readonly size: number;
};

export type ObjectEntry = {
  /**
   * Object key.
   */
  readonly key: string;

  /**
   * Last modification date and time.
   */
  readonly modifiedAt: Date;

  /**
   * Object size.
   */
  readonly size: number;
};

/**
 * Bucket client.
 */
export interface Client {
  /**
   * Get the stats from the given object.
   *
   * @param key Object key.
   * @returns Returns the corresponding stats or undefined when the given object doesn't exists.
   */
  stat(key: string): Promise<ObjectStats | undefined>;

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
   * Copy an object from the bucket into another object.
   *
   * @param sourceKey Source object key.
   * @param targetKey Target object key.
   */
  copy(sourceKey: string, targetKey: string): Promise<void>;

  /**
   * Scan the bucket objects.
   *
   * @param keyPrefix Object key prefix.
   * @returns Returns an iterable generator.
   */
  scan(keyPrefix?: string): AsyncGenerator<ObjectEntry, void>;

  /**
   * Get an URL to retrieve stats from the specified object in the bucket.
   *
   * @param key Object key.
   * @param options Sign options.
   * @returns Returns the signed stat URL.
   */
  getStatUrl(key: string, options: SignReadOptions): Promise<string>;

  /**
   * Get an URL to write the specified object into the bucket.
   *
   * @param key Object key.
   * @param options Sign options.
   * @returns Returns the signed write URL.
   */
  getWriteUrl(key: string, options: SignWriteOptions): Promise<string>;

  /**
   * Get an URL to read the specified object from the bucket.
   *
   * @param key Object key.
   * @param options Sign options.
   * @returns Returns the signed read URL.
   */
  getReadUrl(key: string, options: SignReadOptions): Promise<string>;
}
