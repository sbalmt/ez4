import type { BucketEventType } from '../types/event';

/**
 * Bucket event.
 */
export type BucketEvent = {
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
