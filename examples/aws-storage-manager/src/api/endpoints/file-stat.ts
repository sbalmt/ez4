import type { Object, String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

import { HttpBadRequestError } from '@ez4/gateway';

/**
 * File stat request.
 */
declare class FileStatRequest implements Http.Request {
  parameters: {
    /**
     * File Id.
     */
    fileId: String.UUID;
  };
}

/**
 * File stat response.
 */
declare class FileStatResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * MIME type of the given file.
     */
    type: string;

    /**
     * Custom metadata for the given file.
     */
    metadata?: Object.Any;

    /**
     * File size.
     */
    size: number;
  };
}

/**
 * Handle file stat requests.
 */
export async function fileStatHandler(request: FileStatRequest, context: Service.Context<ApiProvider>): Promise<FileStatResponse> {
  const { fileId } = request.parameters;
  const { fileStorage } = context;

  const stat = await fileStorage.stat(fileId);

  if (!stat) {
    throw new HttpBadRequestError(`File doesn't exists.`);
  }

  return {
    status: 200,
    body: {
      type: stat.type,
      metadata: stat.metadata,
      size: stat.size
    }
  };
}
