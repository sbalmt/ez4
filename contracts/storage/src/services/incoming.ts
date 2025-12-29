import type { BucketRequest } from './request';
import type { BucketEvent } from './event';

/**
 * Incoming event.
 */
export type BucketIncoming<T extends BucketEvent> = T & BucketRequest;
