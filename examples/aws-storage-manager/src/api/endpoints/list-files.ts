import type { Integer } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { FileStatus } from '../../schemas/file';
import type { Api } from '../../api';

import { listFiles } from '../repository';

/**
 * List files request.
 */
declare class ListFilesRequest implements Http.Request {
  parameters: {
    /**
     * Page cursor.
     */
    cursor?: string;

    /**
     * Page limit.
     */
    limit?: Integer.Range<1, 10>;
  };
}

/**
 * List files response.
 */
declare class ListFilesResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Next page cursor.
     */
    next?: string;

    /**
     * List of files.
     */
    files: {
      /**
       * File id.
       */
      id: string;

      /**
       * File status.
       */
      status: FileStatus;

      /**
       * File creation date.
       */
      created_at: string;

      /**
       * File last update date.
       */
      updated_at: string;
    }[];
  };
}

/**
 * Handle list files requests.
 */
export async function listFilesHandler(request: ListFilesRequest, context: Service.Context<Api>): Promise<ListFilesResponse> {
  const { cursor, limit } = request.parameters;
  const { fileDb } = context;

  const results = await listFiles(fileDb, {
    cursor,
    limit
  });

  return {
    status: 200,
    body: {
      next: results.cursor?.toString(),
      files: results.records
    }
  };
}
