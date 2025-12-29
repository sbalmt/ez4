import type { Service } from '@ez4/common';
import type { BucketIncoming } from './incoming';
import type { BucketEvent } from './event';
import type { Bucket } from './contract';

/**
 * Bucket event handler.
 */
export type BucketHandler<T extends BucketEvent> = (
  request: BucketIncoming<T> | T,
  context: Service.Context<Bucket.Service>
) => Promise<void> | void;
