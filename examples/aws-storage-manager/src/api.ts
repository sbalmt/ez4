import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { startUploadHandler } from './api/endpoints/start-upload.js';
import type { startDownloadHandler } from './api/endpoints/start-download.js';
import type { deleteFileHandler } from './api/endpoints/delete-file.js';
import type { listFilesHandler } from './api/endpoints/list-files.js';
import type { FileStorage } from './storage.js';
import type { FileDb } from './dynamo.js';

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
      path: 'GET /start-download/{fileId}';
      handler: typeof startDownloadHandler;
    },
    {
      path: 'DELETE /delete-file/{fileId}';
      handler: typeof deleteFileHandler;
    },
    {
      path: 'GET /list-files';
      handler: typeof listFilesHandler;
    }
  ];

  /**
   * All API services.
   */
  services: {
    fileStorage: Environment.Service<FileStorage>;
    fileDb: Environment.Service<FileDb>;
  };
}
