import type { BucketEventType } from '../types/event';

/**
 * Bucket object event.
 */
export type BucketObjectEvent = {
  /**
   * Type of event.
   */
  readonly eventType: BucketEventType;

  /**
   * Bucket from the event.
   */
  readonly bucketName: string;

  /**
   * Object key in the bucket.
   */
  readonly objectKey: string;

  /**
   * Size of the created object.
   */
  readonly objectSize?: number;
};
