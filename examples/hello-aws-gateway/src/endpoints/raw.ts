import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

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
export function rawHandler(request: Http.Incoming<RawRequest>, context: Service.Context<ApiProvider>): RawResponse {
  const { body, encoded } = request;
  const { selfVariables } = context;

  console.log(selfVariables.TEST_VAR1, body);

  const rawBody = encoded ? Buffer.from(body, 'base64').toString() : body;

  return {
    status: 200,
    body: rawBody
  };
}
