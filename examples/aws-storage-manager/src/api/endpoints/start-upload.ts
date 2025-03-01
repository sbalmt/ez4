import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';
import type { ContentTypes } from '../types.js';

/**
 * Start upload request.
 */
export declare class StartUploadRequest implements Http.Request {
  body: {
    /**
     * File name.
     */
    fileName: String.Size<2, 16>;

    /**
     * Content type of the given file.
     */
    contentType: ContentTypes;
  };
}

/**
 * Start upload response.
 */
export declare class StartUploadResponse implements Http.Response {
  status: 200;

  body: {
    url: string;
  };
}

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
