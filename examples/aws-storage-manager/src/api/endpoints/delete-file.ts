import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpBadRequestError } from '@ez4/gateway';
import { deleteFile } from '../repository.js';

/**
 * Delete file request.
 */
declare class DeleteFileRequest implements Http.Request {
  parameters: {
    /**
     * File name.
     */
    fileId: String.UUID;
  };
}

/**
 * Delete file response.
 */
declare class DeleteFileResponse implements Http.Response {
  status: 204;
}

/**
 * Handle delete file requests.
 */
export async function deleteFileHandler(request: DeleteFileRequest, context: Service.Context<Api>): Promise<DeleteFileResponse> {
  const { fileDb, fileStorage } = context;
  const { fileId } = request.parameters;

  const exists = await fileStorage.exists(fileId);

  if (!exists) {
    throw new HttpBadRequestError(`File doesn't exist`);
  }

  await fileStorage.delete(fileId);

  await deleteFile(fileDb, fileId);

  return {
    status: 204
  };
}
