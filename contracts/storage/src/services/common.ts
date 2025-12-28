import type { Service } from '@ez4/common';
import type { Bucket } from './contract';

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

/**
 * Incoming event.
 */
export type BucketIncoming<T extends BucketEvent> = T & BucketRequest;

/**
 * Bucket request.
 */
export type BucketRequest = {
  /**
   *  Unique identifier for the request.
   */
  readonly requestId: string;

  /**
   * Unique identifier across multiple services.
   */
  readonly traceId?: string;
};

/**
 * Bucket event listener.
 */
export type BucketListener<T extends BucketEvent> = (
  event: Service.AnyEvent<BucketIncoming<T>>,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;

/**
 * Bucket event handler.
 */
export type BucketHandler<T extends BucketEvent> = (
  request: BucketIncoming<T> | T,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
