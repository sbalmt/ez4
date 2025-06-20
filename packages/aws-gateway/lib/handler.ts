import type { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

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
import { ServiceEventType } from '@ez4/common';
import { isScalarSchema } from '@ez4/schema';

type RequestEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<any>;
type ResponseEvent = APIGatewayProxyResultV2;

declare const __EZ4_RESPONSE_SCHEMA: ObjectSchema | null;
declare const __EZ4_BODY_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | null;
declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_ERRORS_MAP: Record<string, number> | null;
declare const __EZ4_CONTEXT: object;

declare function handle(request: Http.Incoming<Http.Request>, context: object): Promise<Http.Response>;
declare function dispatch(event: Service.Event<Http.Incoming<Http.Request>>, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  let lastRequest: Http.Incoming<Http.Request> | undefined;

  const { requestContext } = event;

  const request = {
    requestId: context.awsRequestId,
    timestamp: new Date(requestContext.timeEpoch),
    encoded: event.isBase64Encoded,
    method: requestContext.http.method,
    path: requestContext.http.path
  };

  try {
    await onBegin(request);

    const incomingRequest = await getIncomingRequest(event);

    lastRequest = {
      ...request,
      ...incomingRequest
    };

    await onReady(lastRequest);

    const { status, body, headers } = await handle(lastRequest, __EZ4_CONTEXT);

    return getJsonResponse(status, body, headers);
  } catch (error) {
    await onError(error, lastRequest ?? request);

    if (error instanceof HttpError) {
      return getErrorResponse(error);
    }

    if (error instanceof Error) {
      return getMappedErrorResponse(error) ?? getErrorResponse();
    }

    return getErrorResponse();
  } finally {
    await onEnd(request);
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA ? await getRequestHeaders(event) : undefined,
    parameters: __EZ4_PARAMETERS_SCHEMA ? await getRequestParameters(event) : undefined,
    query: __EZ4_QUERY_SCHEMA ? await getRequestQueryStrings(event) : undefined,
    identity: __EZ4_IDENTITY_SCHEMA ? await getRequestIdentity(event) : undefined,
    body: __EZ4_BODY_SCHEMA ? await getRequestBody(event) : undefined
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

  return getIdentity(JSON.parse(event.requestContext?.authorizer?.lambda?.identity ?? '{}'), __EZ4_IDENTITY_SCHEMA);
};

const getRequestBody = (event: RequestEvent) => {
  if (!__EZ4_BODY_SCHEMA || !event.body) {
    return undefined;
  }

  const { body } = event;

  if (isScalarSchema(__EZ4_BODY_SCHEMA)) {
    return getRequestJsonBody(body, __EZ4_BODY_SCHEMA);
  }

  try {
    return getRequestJsonBody(JSON.parse(body), __EZ4_BODY_SCHEMA);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error({ body });
    }

    throw error;
  }
};

const getResponseBody = (body: Http.JsonBody | Http.RawBody) => {
  if (!__EZ4_RESPONSE_SCHEMA) {
    return undefined;
  }

  if (!isScalarSchema(__EZ4_RESPONSE_SCHEMA)) {
    return JSON.stringify(getResponseJsonBody(body, __EZ4_RESPONSE_SCHEMA));
  }

  return body.toString();
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

const getMappedErrorResponse = (error: Error) => {
  if (!__EZ4_ERRORS_MAP) {
    return undefined;
  }

  const errorType = Object.getPrototypeOf(error);
  const errorClass = errorType?.constructor;
  const errorName = errorClass?.name;

  const statusCode = __EZ4_ERRORS_MAP[errorName];

  if (!statusCode) {
    return undefined;
  }

  return getErrorResponse({
    status: statusCode,
    message: error.message,
    name: errorName
  });
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

const onBegin = async (request: Partial<Http.Incoming<Http.Request>>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Http.Incoming<Http.Request>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Http.Incoming<Http.Request>>) => {
  console.error(error);

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Partial<Http.Incoming<Http.Request>>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
