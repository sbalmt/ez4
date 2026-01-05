import type { ArchitectureType } from '@ez4/common';
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
   * Default configuration for all routes.
   */
  defaults: Http.UseDefaults<{
    /**
     * Use ARM64 architecture.
     */
    architecture: ArchitectureType.Arm;
  }>;

  /**
   * All API routes.
   */
  routes: [
    Http.UseRoute<{
      path: 'POST /start-upload';
      handler: typeof startUploadHandler;
    }>,
    Http.UseRoute<{
      path: 'GET /start-download/{fileId}';
      handler: typeof startDownloadHandler;
    }>,
    Http.UseRoute<{
      path: 'DELETE /delete-file/{fileId}';
      handler: typeof deleteFileHandler;
    }>,
    Http.UseRoute<{
      path: 'GET /list-files';
      handler: typeof listFilesHandler;
    }>
  ];
}
