import type { Service } from '@ez4/common';
import type { BucketObjectEvent } from './object';
import type { BucketIncoming } from './incoming';
import type { Bucket } from './contract';

/**
 * Bucket event handler.
 */
export type BucketHandler<T extends BucketObjectEvent> = (
  request: BucketIncoming<T> | T,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
