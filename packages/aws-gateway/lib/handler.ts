import type { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

import * as GatewayUtils from '@ez4/gateway/utils';

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

declare function dispatch(event: Service.Event<Http.Incoming<Http.Request>>, context: object): Promise<void>;
declare function handle(request: Http.Incoming<Http.Request>, context: object): Promise<Http.Response>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
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

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    const { status, body, headers } = await handle(request, __EZ4_CONTEXT);

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
    body: __EZ4_BODY_SCHEMA ? await getIncomingRequestBody(event) : undefined
  };
};

const getIncomingRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    return GatewayUtils.getHeaders(event.headers ?? {}, __EZ4_HEADERS_SCHEMA);
  }

  return undefined;
};

const getIncomingRequestParameters = (event: RequestEvent) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    return GatewayUtils.getPathParameters(event.pathParameters ?? {}, __EZ4_PARAMETERS_SCHEMA);
  }

  return undefined;
};

const getIncomingRequestQueryStrings = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return GatewayUtils.getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};

const getIncomingRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  const identity = event.requestContext?.authorizer?.lambda?.identity;

  return GatewayUtils.getIdentity(JSON.parse(identity ?? '{}'), __EZ4_IDENTITY_SCHEMA);
};

const getIncomingRequestBody = (event: RequestEvent) => {
  if (!__EZ4_BODY_SCHEMA) {
    return undefined;
  }

  const { body } = event;

  if (isScalarSchema(__EZ4_BODY_SCHEMA)) {
    return GatewayUtils.getRequestBody(body ?? '', __EZ4_BODY_SCHEMA);
  }

  try {
    return GatewayUtils.getRequestBody(JSON.parse(body ?? '{}'), __EZ4_BODY_SCHEMA);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error({ body });
    }

    throw error;
  }
};

const getSuccessResponse = (status: number, body?: Http.JsonBody | Http.RawBody, headers?: Http.Headers) => {
  const response = body ? getSuccessResponseBody(body, headers) : undefined;

  return {
    statusCode: status,
    isBase64Encoded: response?.encoded,
    headers: {
      ...headers,
      ...(response && {
        ['content-type']: response.type
      })
    },
    ...(response && {
      body: response.content
    })
  };
};

const getSuccessResponseBody = (body: Http.JsonBody | Http.RawBody, headers?: Http.Headers) => {
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

  return {
    type: 'application/json',
    content: JSON.stringify(GatewayUtils.getResponseBody(body, __EZ4_RESPONSE_SCHEMA)),
    encoded: false
  };
};

const getDefaultErrorResponse = (error?: HttpError) => {
  const { status, body } = GatewayUtils.getJsonError(error ?? new HttpInternalServerError());

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
