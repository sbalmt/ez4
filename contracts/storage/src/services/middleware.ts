import type { Service } from '@ez4/common';
import type { BucketHandler } from './handler';
import type { BucketObjectEvent } from './object';
import type { Bucket } from './contract';

/**
 * Bucket event middleware.
 */
export type BucketMiddleware = (
  next: BucketHandler<BucketObjectEvent>,
  context: Service.Context<Bucket.Service>
) => BucketHandler<BucketObjectEvent>;
