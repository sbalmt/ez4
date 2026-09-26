import type { Bucket, BucketEventType } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { eventListener } from './listener';
import type { eventHandler } from './events';

/**
 * Example of AWS S3 event triggers deployed with EZ4.
 */
export declare class Storage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'created/*';
      triggers: [BucketEventType.Create];
      listener: typeof eventListener;
      handler: typeof eventHandler;
    }>,
    Bucket.UseEvent<{
      path: 'deleted/*';
      triggers: [BucketEventType.Delete];
      listener: typeof eventListener;
      handler: typeof eventHandler;
    }>,
    Bucket.UseEvent<{
      path: 'all/*';
      listener: typeof eventListener;
      handler: typeof eventHandler;
    }>
  ];

  /**
   * Expose its client to all handlers.
   */
  services: {
    selfClient: Environment.Service<Storage>;
  };
}
