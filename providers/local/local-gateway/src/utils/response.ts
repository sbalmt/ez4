import type { HttpErrors, HttpResponse } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getJsonError, getResponseBody } from '@ez4/gateway/utils';
import { isScalarSchema } from '@ez4/schema';
import { HttpError } from '@ez4/gateway';

export const getOutgoingSuccessResponse = (
  response: HttpResponse,
  status: number,
  headers?: AnyObject,
  body?: Http.JsonBody | Http.RawBody
) => {
  if (!response.body || !body) {
    return getResponseSuccess(status, headers);
  }

  if (isScalarSchema(response.body)) {
    const contentType = headers?.['content-type'] ?? 'application/octet-stream';
    return getResponseSuccess(status, headers, contentType, body.toString());
  }

  const contentData = JSON.stringify(getResponseBody(body, response.body));
  return getResponseSuccess(status, headers, 'application/json', contentData);
};

export const getOutgoingErrorResponse = (error?: Error, errorsMap?: HttpErrors | null) => {
  if (error instanceof HttpError) {
    const { status, body } = getJsonError(error);
    return getResponseError(status, body);
  }

  if (error && errorsMap) {
    const errorData = getMappedErrorData(error, errorsMap);

    if (errorData) {
      const { status, body } = getJsonError(errorData);
      return getResponseError(status, body);
    }
  }

  return getResponseError(500, {
    message: 'Internal server error'
  });
};

const getMappedErrorData = (error: Error, errorsMap: HttpErrors) => {
  const errorType = Object.getPrototypeOf(error);
  const errorClass = errorType?.constructor;
  const errorName = errorClass?.name;

  const statusCode = errorsMap[errorName];

  if (!statusCode) {
    return undefined;
  }

  return {
    status: statusCode,
    message: error.message,
    name: errorName
  };
};

const getResponseSuccess = (status: number, headers?: AnyObject, contentType?: string, contentData?: string) => {
  return {
    status,
    headers: {
      ...headers,
      ...(contentType && {
        ['content-type']: contentType
      })
    },
    ...(contentData && {
      body: contentData
    })
  };
};

const getResponseError = (status: number, errorData: AnyObject) => {
  return {
    status,
    body: JSON.stringify(errorData),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
