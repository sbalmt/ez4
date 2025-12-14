import type { WsResponse } from '@ez4/gateway/library';
import { HttpError, type Ws } from '@ez4/gateway';

import { getJsonError, getResponseBody } from '@ez4/gateway/utils';
import { isScalarSchema } from '@ez4/schema';

export const getWsSuccessResponse = (metadata: WsResponse, response: Ws.Response, preferences?: Ws.Preferences) => {
  const { body } = response;

  if (!metadata.body || !body) {
    return undefined;
  }

  if (!isScalarSchema(metadata.body)) {
    return JSON.stringify(getResponseBody(body, metadata.body, preferences));
  }

  return body.toString();
};

export const getWsErrorResponse = (error?: Error) => {
  if (error instanceof HttpError) {
    const { body } = getJsonError(error);

    return JSON.stringify(body);
  }

  return JSON.stringify({
    message: 'Internal server error',
    type: 'error'
  });
};
