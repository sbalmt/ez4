import type { Bucket, BucketEventType } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { eventListener } from './listener';
import type { eventHandler, storageMiddleware } from './events';

/**
 * Example of AWS S3 event triggers deployed with EZ4.
 */
export declare class Storage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'created/*';
      triggers: [BucketEventType.Create];
      handler: typeof eventHandler;
      middlewares: [typeof storageMiddleware];
      listener: typeof eventListener;
    }>,
    Bucket.UseEvent<{
      path: 'deleted/*';
      triggers: [BucketEventType.Delete];
      handler: typeof eventHandler;
      middlewares: [typeof storageMiddleware];
      listener: typeof eventListener;
    }>,
    Bucket.UseEvent<{
      path: 'all/*';
      handler: typeof eventHandler;
      middlewares: [typeof storageMiddleware];
      listener: typeof eventListener;
    }>
  ];

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<Storage>;
  };
}
