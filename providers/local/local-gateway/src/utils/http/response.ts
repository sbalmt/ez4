import type { HttpErrors, HttpResponse } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getJsonError, resolveResponseBody } from '@ez4/gateway/utils';
import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { isScalarSchema } from '@ez4/schema';
import { HttpError } from '@ez4/gateway';

export const getHttpSuccessResponse = (metadata: HttpResponse, response: Http.Response, preferences?: Http.Preferences) => {
  const { status, body, headers } = response;

  if (!metadata.body || !body) {
    return getSuccessResponse(status, headers);
  }

  if (isScalarSchema(metadata.body)) {
    const contentType = (headers as AnyObject)?.['content-type'] ?? 'application/octet-stream';

    return getSuccessResponse(status, headers, contentType, body.toString());
  }

  const payload = JSON.stringify(resolveResponseBody(body, metadata.body, preferences));

  return getSuccessResponse(status, headers, 'application/json', payload);
};

export const getHttpErrorResponse = (error?: Error, errorsMap?: HttpErrors | null) => {
  if (error instanceof HttpError) {
    const { status, body } = getJsonError(error);

    return getErrorResponse(status, body);
  }

  if (error && errorsMap) {
    const errorData = getMappedErrorData(error, errorsMap);

    if (errorData) {
      const { status, body } = getJsonError(errorData);

      return getErrorResponse(status, body);
    }
  }

  return getErrorResponse(500, {
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
