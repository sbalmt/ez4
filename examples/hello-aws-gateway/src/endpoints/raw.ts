import type { Http } from '@ez4/gateway';

/**
 * Raw request example.
 */
declare class RawRequest implements Http.Request {
  body: Http.RawBody;
}

/**
 * Raw response example.
 */
declare class RawResponse implements Http.Response {
  status: 200;
  body: Http.RawBody;
}

/**
 * Handler for `raw` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function rawHandler(request: Http.Incoming<RawRequest>): RawResponse {
  const { body, encoded } = request;

  const rawBody = encoded ? Buffer.from(body, 'base64').toString() : body;

  return {
    status: 200,
    body: rawBody
  };
}
