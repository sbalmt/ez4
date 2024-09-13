import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

const enum ContentTypes {
  ImageJPEG = 'image/jpeg',
  ImagePNG = 'image/png'
}

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
