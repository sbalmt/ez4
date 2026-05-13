import type { Service } from '@ez4/common';
import type { BucketObjectEvent } from './object';
import type { BucketIncoming } from './incoming';
import type { Bucket } from './contract';

/**
 * Bucket event listener.
 */
export type BucketListener<T extends BucketObjectEvent> = (
  event: Service.AnyEvent<BucketIncoming<T>>,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
