import type { Environment } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

/**
 * Example of AWS Bucket deployed with EZ4.
 */
export declare class Files extends Bucket.Service {
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
}
