import type { Service } from '@ez4/common';
import type { BucketIncoming } from './incoming';
import type { BucketEvent } from './event';
import type { Bucket } from './contract';

/**
 * Bucket event listener.
 */
export type BucketListener<T extends BucketEvent> = (
  event: Service.AnyEvent<BucketIncoming<T>>,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
