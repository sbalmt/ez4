import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpBadRequestError } from '@ez4/gateway';

/**
 * Start download request.
 */
export declare class StartDownloadRequest implements Http.Request {
  body: {
    /**
     * File name.
     */
    fileName: string;
  };
}

/**
 * Start download response.
 */
export declare class StartDownloadResponse implements Http.Response {
  status: 200;

  body: {
    url: string;
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
