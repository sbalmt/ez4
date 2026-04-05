import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';
import type { ContentTypes } from '../types';

import { Integer } from '@ez4/schema';

import { createFile } from '@/api/repository';
import { FileStatus } from '@/schemas/file';

/**
 * Start upload request.
 */
declare class StartUploadRequest implements Http.Request {
  body: {
    /**
     * Content type of the given file.
     */
    contentType: ContentTypes;

    /**
     * Max cache age (in seconds) for the given file.
     */
    maxCacheAge?: Integer.Any;
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
     * Signed URL to upload the file.
     */
    url: string;

    /**
     * Headers required when uploading the file.
     */
    headers?: {
      /**
       * Cache control header to send.
       */
      cacheControl?: string;

      /**
       * Expiration date header to send.
       */
      expires?: string;
    };
  };
}

/**
 * Handle start upload requests.
 */
export async function startUploadHandler(request: StartUploadRequest, context: Service.Context<ApiProvider>): Promise<StartUploadResponse> {
  const { contentType, maxCacheAge } = request.body;
  const { fileDb, fileStorage } = context;

  const fileId = await createFile(fileDb, {
    status: FileStatus.Pending
  });

  const expires = maxCacheAge ? new Date(Date.now() + maxCacheAge * 1000) : undefined;
  const cacheControl = maxCacheAge ? `max-age=${maxCacheAge}, public` : undefined;

  const uploadUrl = await fileStorage.getWriteUrl(fileId, {
    expiresIn: 60,
    contentType,
    metadata: {
      'x-file-id': fileId
    },
    headers: {
      cacheControl,
      expires
    }
  });

  return {
    status: 200,
    body: {
      id: fileId,
      url: uploadUrl,
      headers: {
        expires: expires?.toUTCString(),
        cacheControl
      }
    }
  };
}
