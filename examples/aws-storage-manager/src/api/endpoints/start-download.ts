import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpBadRequestError } from '@ez4/gateway';

/**
 * Start download request.
 */
declare class StartDownloadRequest implements Http.Request {
  parameters: {
    /**
     * File Id.
     */
    fileId: String.UUID;
  };
}

/**
 * Start download response.
 */
declare class StartDownloadResponse implements Http.Response {
  status: 200;

  body: {
    url: string;
  };
}

/**
 * Handle start download requests.
 */
export async function startDownloadHandler(request: StartDownloadRequest, context: Service.Context<Api>): Promise<StartDownloadResponse> {
  const { fileId } = request.parameters;
  const { fileStorage } = context;

  const exists = await fileStorage.exists(fileId);

  if (!exists) {
    throw new HttpBadRequestError(`File doesn't exists.`);
  }

  const downloadUrl = await fileStorage.getReadUrl(fileId, {
    expiresIn: 60
  });

  return {
    status: 200,
    body: {
      url: downloadUrl
    }
  };
}
