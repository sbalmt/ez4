/**
 * Bucket CORS configuration.
 */
export interface BucketCors {
  /**
   * List of allowed origins.
   */
  allowOrigins: string[];

  /**
   * List of allowed methods.
   */
  allowMethods?: string[];

  /**
   * List of allowed headers.
   */
  allowHeaders?: string[];

  /**
   * List of exposed headers.
   */
  exposeHeaders?: string[];

  /**
   * Determines how long the preflight result can be cached.
   */
  maxAge?: number;
}

/**
 * Bucket event type.
 */
export const enum BucketEventType {
  Create = 'create',
  Delete = 'delete'
}

/**
 * Bucket event.
 */
export type BucketEvent = {
  /**
   * Request tracking Id.
   */
  requestId: string;

  /**
   * Type of event.
   */
  eventType: BucketEventType;

  /**
   * Bucket from the event.
   */
  bucketName: string;

  /**
   * Size of the created object.
   */
  objectSize?: number;

  /**
   * Object key in the bucket.
   */
  objectKey: string;
};
