import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import type {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2,
  Context
} from 'aws-lambda';

import {
  getHeaders,
  getIdentity,
  getPathParameters,
  getQueryStrings,
  getRequestJsonBody,
  getResponseJsonBody,
  getJsonError
} from '@ez4/aws-gateway/runtime';

import { HttpError, HttpInternalServerError } from '@ez4/gateway';

type RequestEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<any>;
type ResponseEvent = APIGatewayProxyResultV2;

declare function next(request: unknown, context: object): Promise<Http.Response>;

declare const __EZ4_RESPONSE_SCHEMA: ObjectSchema | null;
declare const __EZ4_BODY_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | null;
declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  try {
    const request = {
      path: requestContext.http.path,
      method: requestContext.http.method,
      requestId: context.awsRequestId,
      headers: __EZ4_HEADERS_SCHEMA && (await getRequestHeaders(event)),
      identity: __EZ4_IDENTITY_SCHEMA && (await getRequestIdentity(event)),
      parameters: __EZ4_PARAMETERS_SCHEMA && (await getRequestParameters(event)),
      query: __EZ4_QUERY_SCHEMA && (await getRequestQueryStrings(event)),
      body: __EZ4_BODY_SCHEMA && (await getRequestBody(event))
    };

    const { status, body, headers } = await next(request, __EZ4_CONTEXT);

    return getJsonResponse(status, body, headers);
  } catch (error) {
    if (error instanceof HttpError) {
      return getErrorResponse(error);
    }

    console.error(error);

    return getErrorResponse();
  }
}

const getRequestHeaders = (event: RequestEvent) => {
  if (!__EZ4_HEADERS_SCHEMA) {
    return undefined;
  }

  const rawHeaders = event.headers ?? {};

  return getHeaders(rawHeaders, __EZ4_HEADERS_SCHEMA);
};

const getRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  const rawIdentity = event.requestContext?.authorizer?.lambda?.identity ?? '{}';

  return getIdentity(JSON.parse(rawIdentity), __EZ4_IDENTITY_SCHEMA);
};

const getRequestParameters = (event: RequestEvent) => {
  if (!__EZ4_PARAMETERS_SCHEMA) {
    return undefined;
  }

  const rawParameters = event.pathParameters ?? {};

  return getPathParameters(rawParameters, __EZ4_PARAMETERS_SCHEMA);
};

const getRequestQueryStrings = (event: RequestEvent) => {
  if (!__EZ4_QUERY_SCHEMA) {
    return undefined;
  }

  const rawQuery = event.queryStringParameters ?? {};

  return getQueryStrings(rawQuery, __EZ4_QUERY_SCHEMA);
};

const getRequestBody = (event: RequestEvent) => {
  if (!__EZ4_BODY_SCHEMA) {
    return undefined;
  }

  const rawBody = event.body || '{}';

  try {
    return getRequestJsonBody(JSON.parse(rawBody), __EZ4_BODY_SCHEMA);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.debug(rawBody);
    }

    throw error;
  }
};

const getResponseBody = (body: Http.JsonBody) => {
  if (!__EZ4_RESPONSE_SCHEMA) {
    return undefined;
  }

  const rawBody = getResponseJsonBody(body, __EZ4_RESPONSE_SCHEMA);

  return JSON.stringify(rawBody);
};

const getJsonResponse = (status: number, body?: Http.JsonBody, headers?: Http.Headers) => {
  return {
    statusCode: status,
    ...(body && {
      body: getResponseBody(body)
    }),
    headers: {
      ...headers,
      ...(body && {
        ['content-type']: 'application/json'
      })
    }
  };
};

const getErrorResponse = (error?: HttpError) => {
  const { status, body } = getJsonError(error ?? new HttpInternalServerError());

  return {
    statusCode: status,
    body: JSON.stringify(body),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
