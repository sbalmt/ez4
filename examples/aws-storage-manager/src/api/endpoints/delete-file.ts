import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpBadRequestError } from '@ez4/gateway';

/**
 * Delete file request.
 */
export declare class DeleteFileRequest implements Http.Request {
  body: {
    /**
     * File name.
     */
    fileName: string;
  };
}

/**
 * Delete file response.
 */
export declare class DeleteFileResponse implements Http.Response {
  status: 204;
}

/**
 * Handle delete file requests.
 */
export async function deleteFileHandler(
  request: DeleteFileRequest,
  context: Service.Context<Api>
): Promise<DeleteFileResponse> {
  const { body } = request;
  const { fileStorage } = context;

  const exists = await fileStorage.exists(body.fileName);

  if (!exists) {
    throw new HttpBadRequestError(`File doesn't exists.`);
  }

  await fileStorage.delete(body.fileName);

  return {
    status: 204
  };
}
