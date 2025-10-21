import type { HttpErrors, HttpPreferences, HttpResponse } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getJsonError, getResponseBody } from '@ez4/gateway/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { isScalarSchema } from '@ez4/schema';
import { HttpError } from '@ez4/gateway';

export const getSuccessResponse = (metadata: HttpResponse, response: Http.Response, preferences?: HttpPreferences) => {
  const { status, body, headers } = response;

  if (!metadata.body || !body) {
    return getResponseSuccess(status, headers);
  }

  if (isScalarSchema(metadata.body)) {
    const contentType = (headers as AnyObject)?.['content-type'] ?? 'application/octet-stream';

    return getResponseSuccess(status, headers, contentType, body.toString());
  }

  const payload = JSON.stringify(getResponseBody(body, metadata.body, preferences));

  return getResponseSuccess(status, headers, 'application/json', payload);
};

export const getErrorResponse = (error?: Error, errorsMap?: HttpErrors | null) => {
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
