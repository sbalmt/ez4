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
  write(key: string, content: ReadableStream, options?: WriteOptions): Promise<void>;

  /**
   * Read an object from the bucket.
   *
   * @param key Object key.
   * @returns Returns the readable stream corresponding to the object contents.
   */
  read(key: string): Promise<ReadableStream>;

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
  getWriteUrl(key: string, options: SignedWriteOptions): Promise<string>;

  /**
   * Get an URL to read the specified object from the bucket.
   * @param key Object key.
   * @param options Sign options.
   */
  getReadUrl(key: string, options: SignedReadOptions): Promise<string>;
}

/**
 * Options for writing an object with the client.
 */
export type WriteOptions = {
  /**
   * Define an expiration date for the object.
   */
  autoExpireDate?: Date;
};

/**
 * Options for signing an URL.
 */
export type SignOptions = {
  /**
   * Define an expiration time (in seconds) for the signed URL.
   */
  expiresIn: number;
};

/**
 * Options for writing an object through a signed URL.
 */
export type SignedWriteOptions = WriteOptions &
  SignOptions & {
    /**
     * Define the expected content type.
     */
    contentType: string;
  };

/**
 * Options for reading an object through a signed URL.
 */
export type SignedReadOptions = SignOptions;
