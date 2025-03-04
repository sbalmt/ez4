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

declare function next(request: Http.Incoming<any>, context: object): Promise<Http.Response>;
declare function fail(error: Error, request: Http.Incoming<any>, context: object): Promise<void>;

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

  requestContext.time;

  const request = {
    requestId: context.awsRequestId,
    timestamp: new Date(requestContext.timeEpoch),
    method: requestContext.http.method,
    path: requestContext.http.path
  };

  try {
    Object.assign(request, await getIncomingRequest(event));

    const { status, body, headers } = await next(request, __EZ4_CONTEXT);

    return getJsonResponse(status, body, headers);
  } catch (error) {
    if (error instanceof HttpError) {
      return getErrorResponse(error);
    }

    console.error(error);

    fail(error, request, context);

    return getErrorResponse();
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA && (await getRequestHeaders(event)),
    parameters: __EZ4_PARAMETERS_SCHEMA && (await getRequestParameters(event)),
    query: __EZ4_QUERY_SCHEMA && (await getRequestQueryStrings(event)),
    identity: __EZ4_IDENTITY_SCHEMA && (await getRequestIdentity(event)),
    body: __EZ4_BODY_SCHEMA && (await getRequestBody(event))
  };
};

const getRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    return getHeaders(event.headers ?? {}, __EZ4_HEADERS_SCHEMA);
  }

  return undefined;
};

const getRequestParameters = (event: RequestEvent) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    return getPathParameters(event.pathParameters ?? {}, __EZ4_PARAMETERS_SCHEMA);
  }

  return undefined;
};

const getRequestQueryStrings = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};

const getRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  return getIdentity(
    JSON.parse(event.requestContext?.authorizer?.lambda?.identity ?? '{}'),
    __EZ4_IDENTITY_SCHEMA
  );
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
  if (__EZ4_RESPONSE_SCHEMA) {
    return JSON.stringify(getResponseJsonBody(body, __EZ4_RESPONSE_SCHEMA));
  }

  return undefined;
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
