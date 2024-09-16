import type { Service } from '@ez4/common';
import type { Api } from '../api.js';

import type {
  StartUploadRequest,
  StartUploadResponse,
  StartDownloadRequest,
  StartDownloadResponse,
  DeleteFileRequest,
  DeleteFileResponse
} from './types.js';

import { HttpBadRequestError } from '@ez4/gateway';

/**
 * Handle start upload requests.
 */
export async function startUploadHandler(
  request: StartUploadRequest,
  context: Service.Context<Api>
): Promise<StartUploadResponse> {
  const { body } = request;
  const { fileStorage } = context;

  const uploadUrl = await fileStorage.getWriteUrl(body.fileName, {
    contentType: body.contentType,
    expiresIn: 60
  });

  return {
    status: 200,

    body: {
      url: uploadUrl
    }
  };
}

/**
 * Handle start download requests.
 */
export async function startDownloadHandler(
  request: StartDownloadRequest,
  context: Service.Context<Api>
): Promise<StartDownloadResponse> {
  const { body } = request;
  const { fileStorage } = context;

  const exists = await fileStorage.exists(body.fileName);

  if (!exists) {
    throw new HttpBadRequestError(`File doesn't exists.`);
  }

  const downloadUrl = await fileStorage.getReadUrl(body.fileName, {
    expiresIn: 60
  });

  return {
    status: 200,

    body: {
      url: downloadUrl
    }
  };
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
