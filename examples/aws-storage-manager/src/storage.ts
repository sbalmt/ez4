import type { Environment } from '@ez4/common';
import type { Bucket } from '@ez4/storage';
import type { syncStorageHandler } from './api/events/sync-storage';
import type { syncStorageListener } from './common';
import type { FileDb } from './dynamo';

/**
 * Example of AWS Bucket deployed with EZ4.
 */
export declare class FileStorage extends Bucket.Service {
  /**
   * Define auto-expiration in 5 days.
   */
  autoExpireDays: 5;

  /**
   * Define CORs for frontend upload with signed URLs.
   */
  cors: {
    allowOrigins: [Environment.Variable<'FRONTEND_URL'>];
    allowHeaders: ['content-type'];
    allowMethods: ['PUT'];
  };

  /**
   * Define an event handler for syncing the storage events.
   */
  events: {
    listener: typeof syncStorageListener;
    handler: typeof syncStorageHandler;
  };

  /**
   * All Storage services.
   */
  services: {
    fileDb: Environment.Service<FileDb>;
  };
}
