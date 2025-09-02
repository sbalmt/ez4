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
  eventType: BucketEventType;

  /**
   * Bucket from the event.
   */
  bucketName: string;

  /**
   * Object key in the bucket.
   */
  objectKey: string;

  /**
   * Size of the created object.
   */
  objectSize?: number;
};

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
 * Incoming event.
 */
export type BucketIncoming<T extends BucketEvent> = T & BucketRequest;

/**
 * Bucket request.
 */
export type BucketRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
};

/**
 * Message listener.
 */
export type BucketListener<T extends BucketEvent> = (
  event: Service.AnyEvent<BucketIncoming<T>>,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;

/**
 * Event handler.
 */
export type BucketHandler<T extends BucketEvent> = (
  request: BucketIncoming<T> | T,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
