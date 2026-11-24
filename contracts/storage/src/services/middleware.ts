import type { BucketHandler } from './handler';
import type { BucketObjectEvent } from './object';

/**
 * Bucket event middleware.
 */
export type BucketMiddleware = (next: BucketHandler<BucketObjectEvent>) => BucketHandler<BucketObjectEvent>;
