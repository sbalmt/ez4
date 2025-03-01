import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { Files } from './storage.js';

import type { startUploadHandler } from './api/endpoints/start-upload.js';
import type { startDownloadHandler } from './api/endpoints/start-download.js';
import type { deleteFileHandler } from './api/endpoints/delete-file.js';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Storage Manager';

  /**
   * All API routes.
   */
  routes: [
    {
      path: 'POST /start-upload';
      handler: typeof startUploadHandler;
    },
    {
      path: 'POST /start-download';
      handler: typeof startDownloadHandler;
    },
    {
      path: 'DELETE /delete-file';
      handler: typeof deleteFileHandler;
    }
  ];

  /**
   * All API services.
   */
  services: {
    fileStorage: Environment.Service<Files>;
  };
}
