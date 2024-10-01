import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import type {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2,
  Context
} from 'aws-lambda';

import {
  formatJsonError,
  getHeaders,
  getIdentity,
  getPathParameters,
  getQueryStrings,
  getJsonBody
} from '@ez4/aws-gateway/runtime';

import { HttpError, HttpInternalServerError } from '@ez4/gateway';

type RequestEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<any>;
type ResponseEvent = APIGatewayProxyResultV2;

declare function next(request: unknown, context: object): Promise<Http.Response>;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_BODY_SCHEMA: ObjectSchema | null;
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
      query: __EZ4_QUERY_SCHEMA && (await getRequestQuery(event)),
      body: __EZ4_BODY_SCHEMA && (await getRequestBody(event))
    };

    const response = await next(request, __EZ4_CONTEXT);

    const { status, headers, body } = response;

    return formatJsonResponse(status, headers, JSON.stringify(body));
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error(error.message ?? error);

      error = new HttpInternalServerError();
    }

    return formatJsonResponse(error.status, formatJsonError(error));
  }
}

const getRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    const rawHeaders = event.headers ?? {};
    return getHeaders(rawHeaders, __EZ4_HEADERS_SCHEMA);
  }

  return undefined;
};

const getRequestIdentity = (event: RequestEvent) => {
  if (__EZ4_IDENTITY_SCHEMA) {
    const rawIdentity = event.requestContext?.authorizer?.lambda?.identity ?? '{}';
    return getIdentity(JSON.parse(rawIdentity), __EZ4_IDENTITY_SCHEMA);
  }

  return undefined;
};

const getRequestParameters = (event: RequestEvent) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    const rawParameters = event.pathParameters ?? {};
    return getPathParameters(rawParameters, __EZ4_PARAMETERS_SCHEMA);
  }

  return undefined;
};

const getRequestQuery = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    const rawQuery = event.queryStringParameters ?? {};
    return getQueryStrings(rawQuery, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};

const getRequestBody = (event: RequestEvent) => {
  if (__EZ4_BODY_SCHEMA) {
    const rawBody = event.body || '{}';
    return getJsonBody(JSON.parse(rawBody), __EZ4_BODY_SCHEMA);
  }

  return undefined;
};

const formatJsonResponse = (status: number, headers?: Http.Headers, body?: string) => {
  return {
    statusCode: status,
    ...(body && { body }),
    headers: {
      ...headers,
      ...(body && {
        ['content-type']: 'application/json'
      })
    }
  };
};
