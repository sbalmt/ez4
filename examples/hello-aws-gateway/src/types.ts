import type { Http } from '@ez4/gateway';

/**
 * Post request example.
 */
export declare class PostRequest implements Http.Request {
  body: {
    /**
     * Example of validated `string` property coming from the body request.
     */
    foo: string;
  };
}

/**
 * Post response example.
 */
export declare class PostResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * Example of `id` in the response.
     */
    id: string;
  };
}

/**
 * Get request example.
 */
export declare class GetRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the path parameters.
     */
    id: string;
  };
}

/**
 * Get response example.
 */
export declare class GetResponse implements Http.Response {
  status: 200;

  body: {
    foo: string;
  };
}
