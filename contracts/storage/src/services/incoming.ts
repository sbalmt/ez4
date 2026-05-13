import type { BucketObjectEvent } from './object';
import type { BucketRequest } from './request';

/**
 * Incoming event.
 */
export type BucketIncoming<T extends BucketObjectEvent> = T & BucketRequest;
