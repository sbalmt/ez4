import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../../provider';
import type { ContentTypes } from '../types';

import { FileStatus } from '../../schemas/file';
import { createFile } from '../repository';

/**
 * Start upload request.
 */
declare class StartUploadRequest implements Http.Request {
  body: {
    /**
     * Content type of the given file.
     */
    contentType: ContentTypes;
  };
}

/**
 * Start upload response.
 */
declare class StartUploadResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * File Id.
     */
    id: string;

    /**
     * Signed upload URL.
     */
    url: string;
  };
}

/**
 * Handle start upload requests.
 */
export async function startUploadHandler(request: StartUploadRequest, context: Service.Context<ApiProvider>): Promise<StartUploadResponse> {
  const { fileDb, fileStorage } = context;
  const { contentType } = request.body;

  const fileId = await createFile(fileDb, {
    status: FileStatus.Pending
  });

  const uploadUrl = await fileStorage.getWriteUrl(fileId, {
    contentType,
    expiresIn: 60
  });

  return {
    status: 200,
    body: {
      id: fileId,
      url: uploadUrl
    }
  };
}
