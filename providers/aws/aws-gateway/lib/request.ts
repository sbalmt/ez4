import type { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpPreferences } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { HttpError, HttpInternalServerError } from '@ez4/gateway';
import { isObjectSchema, isScalarSchema } from '@ez4/schema';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID } from '@ez4/utils';

import {
  resolveHeaders,
  resolvePathParameters,
  resolveQueryStrings,
  resolveIdentity,
  resolveRequestBody,
  resolveValidation,
  resolveResponseBody,
  getJsonError
} from '@ez4/gateway/utils';

type RequestEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<any>;
type ResponseEvent = APIGatewayProxyResultV2;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_BODY_SCHEMA: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
declare const __EZ4_RESPONSE_SCHEMA: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
declare const __EZ4_ERRORS_MAP: Record<string, number> | null;
declare const __EZ4_PREFERENCES: HttpPreferences;
declare const __EZ4_CONTEXT: object;

declare function handle(request: Http.Incoming<Http.Request>, context: object): Promise<Http.Response>;
declare function dispatch(event: Http.ServiceEvent<Http.Request>, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const traceId = event.headers['x-trace-id'] ?? getRandomUUID();

  const request: Http.Incoming<Http.Request> = {
    timestamp: new Date(requestContext.timeEpoch),
    requestId: context.awsRequestId,
    method: requestContext.http.method,
    path: requestContext.http.path,
    encoded: event.isBase64Encoded,
    traceId
  };

  Runtime.setScope({
    traceId
  });

  try {
    await onBegin(request);

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    const { status, body, headers } = await handle(request, __EZ4_CONTEXT);

    await onDone(request);

    return getSuccessResponse(status, body, headers);

    //
  } catch (error) {
    await onError(error, request);

    if (error instanceof HttpError) {
      return getDefaultErrorResponse(error);
    }

    if (error instanceof Error) {
      return getMappedErrorResponse(error);
    }

    return getDefaultErrorResponse();
    //
  } finally {
    await onEnd(request);
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA ? await getIncomingRequestHeaders(event) : undefined,
    parameters: __EZ4_PARAMETERS_SCHEMA ? await getIncomingRequestParameters(event) : undefined,
    query: __EZ4_QUERY_SCHEMA ? await getIncomingRequestQueryStrings(event) : undefined,
    identity: __EZ4_IDENTITY_SCHEMA ? await getIncomingRequestIdentity(event) : undefined,
    body: __EZ4_BODY_SCHEMA ? await getIncomingRequestBody(event) : undefined,
    data: event.body
  };
};

const getIncomingRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    return resolveHeaders(event.headers ?? {}, __EZ4_HEADERS_SCHEMA, onCustomValidation);
  }

  return undefined;
};

const getIncomingRequestParameters = (event: RequestEvent) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    return resolvePathParameters(event.pathParameters ?? {}, __EZ4_PARAMETERS_SCHEMA, onCustomValidation);
  }

  return undefined;
};

const getIncomingRequestQueryStrings = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return resolveQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA, __EZ4_PREFERENCES, onCustomValidation);
  }

  return undefined;
};

const getIncomingRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  const identity = event.requestContext?.authorizer?.lambda?.identity;

  return resolveIdentity(JSON.parse(identity ?? '{}'), __EZ4_IDENTITY_SCHEMA, onCustomValidation);
};

const getIncomingRequestBody = (event: RequestEvent) => {
  if (!__EZ4_BODY_SCHEMA) {
    return undefined;
  }

  const { body } = event;

  if (isScalarSchema(__EZ4_BODY_SCHEMA) || (isObjectSchema(__EZ4_BODY_SCHEMA) && __EZ4_BODY_SCHEMA.definitions?.encoded)) {
    return resolveRequestBody(body, __EZ4_BODY_SCHEMA, undefined, onCustomValidation);
  }

  try {
    const payload = body && JSON.parse(body);
    return resolveRequestBody(payload, __EZ4_BODY_SCHEMA, __EZ4_PREFERENCES, onCustomValidation);
    //
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error({ body });
    }

    throw error;
  }
};

const getOutgoingResponseBody = (body: Http.JsonBody | Http.RawBody, headers?: AnyObject) => {
  if (!__EZ4_RESPONSE_SCHEMA) {
    return undefined;
  }

  if (isScalarSchema(__EZ4_RESPONSE_SCHEMA)) {
    return {
      type: headers?.['content-type'] ?? 'application/octet-stream',
      content: Buffer.from(body.toString(), 'utf-8').toString('base64'),
      encoded: true
    };
  }

  const payload = resolveResponseBody(body, __EZ4_RESPONSE_SCHEMA, __EZ4_PREFERENCES);

  return {
    type: 'application/json',
    content: JSON.stringify(payload),
    encoded: false
  };
};

const getSuccessResponse = (status: number, body?: Http.JsonBody | Http.RawBody, headers?: Http.Headers) => {
  const response = body ? getOutgoingResponseBody(body, headers) : undefined;
  const scope = Runtime.getScope();

  return {
    statusCode: status,
    isBase64Encoded: response?.encoded,
    headers: {
      ...headers,
      ...(response && {
        ['content-type']: response.type
      }),
      ...(scope && {
        ['x-trace-id']: scope.traceId
      })
    },
    ...(response && {
      body: response.content
    })
  };
};

const getDefaultErrorResponse = (error?: HttpError) => {
  const response = getJsonError(error ?? new HttpInternalServerError());
  const scope = Runtime.getScope();

  return {
    statusCode: response.status,
    body: JSON.stringify(response.body),
    headers: {
      ['content-type']: 'application/json',
      ...(scope && {
        ['x-trace-id']: scope.traceId
      })
    }
  };
};

const getMappedErrorResponse = (error: Error) => {
  if (!__EZ4_ERRORS_MAP) {
    return getDefaultErrorResponse();
  }

  const errorType = Object.getPrototypeOf(error);
  const errorClass = errorType?.constructor;
  const errorName = errorClass?.name;

  const statusCode = __EZ4_ERRORS_MAP[errorName];

  if (!statusCode) {
    return getDefaultErrorResponse();
  }

  return getDefaultErrorResponse({
    status: statusCode,
    message: error.message,
    name: errorName
  });
};

const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
  return resolveValidation(value, __EZ4_CONTEXT, context.type);
};

const onBegin = async (request: Http.Incoming<Http.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Http.Incoming<Http.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Http.Incoming<Http.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Http.Incoming<Http.Request>) => {
  console.error({ ...Runtime.getScope(), error });

  return dispatch(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const onEnd = async (request: Http.Incoming<Http.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
