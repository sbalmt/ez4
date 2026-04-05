import type { Http } from '@ez4/gateway';
import type { startUploadHandler } from '@/api/endpoints/start-upload';
import type { startDownloadHandler } from '@/api/endpoints/start-download';
import type { deleteFileHandler } from '@/api/endpoints/delete-file';
import type { listFilesHandler } from '@/api/endpoints/list-files';
import type { fileStatHandler } from '@/api/endpoints/file-stat';

export type ApiRoutes = [
  Http.UseRoute<{
    path: 'POST /start-upload';
    handler: typeof startUploadHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /file/{fileId}/download';
    handler: typeof startDownloadHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /file/{fileId}';
    handler: typeof fileStatHandler;
  }>,
  Http.UseRoute<{
    path: 'DELETE /file/{fileId}';
    handler: typeof deleteFileHandler;
  }>,
  Http.UseRoute<{
    path: 'GET /files';
    handler: typeof listFilesHandler;
  }>
];
