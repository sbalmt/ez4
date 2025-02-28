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

export const enum BucketEventType {
  Create = 'create',
  Delete = 'delete'
}

export type BucketEvent = {
  eventType: BucketEventType;
  bucketName: string;
  objectSize: number;
  objectKey: string;
};
