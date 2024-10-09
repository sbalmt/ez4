import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { Files } from './storage.js';

import type { DeleteFileRequest, StartDownloadRequest, StartUploadRequest } from './api/types.js';

import type {
  deleteFileHandler,
  startDownloadHandler,
  startUploadHandler
} from './api/handlers.js';

type ApiRequests = [StartUploadRequest, StartDownloadRequest, DeleteFileRequest];

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service<ApiRequests> {
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
