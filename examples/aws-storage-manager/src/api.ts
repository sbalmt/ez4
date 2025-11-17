import type { Http } from '@ez4/gateway';
import type { startUploadHandler } from '@/api/endpoints/start-upload';
import type { startDownloadHandler } from '@/api/endpoints/start-download';
import type { deleteFileHandler } from '@/api/endpoints/delete-file';
import type { listFilesHandler } from '@/api/endpoints/list-files';

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
}
