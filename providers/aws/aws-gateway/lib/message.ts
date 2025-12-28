import type { ArraySchema, ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema';
import type { ValidationCustomContext } from '@ez4/validator';
import type { HttpPreferences } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import type {
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyWithLambdaAuthorizerEvent,
  APIGatewayProxyResultV2,
  Context
} from 'aws-lambda';

import { resolveIdentity, getJsonError, resolveRequestBody, resolveResponseBody, resolveValidation } from '@ez4/gateway/utils';
import { HttpError, HttpInternalServerError } from '@ez4/gateway';
import { isObjectSchema, isScalarSchema } from '@ez4/schema';
import { ServiceEventType } from '@ez4/common';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

type RequestEvent = APIGatewayProxyEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2> &
  APIGatewayProxyWithLambdaAuthorizerEvent<any>;

type ResponseEvent = APIGatewayProxyResultV2;

declare const __EZ4_BODY_SCHEMA: ObjectSchema | UnionSchema;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_RESPONSE_SCHEMA: ObjectSchema | UnionSchema | ArraySchema | ScalarSchema | null;
declare const __EZ4_PREFERENCES: HttpPreferences;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Ws.ServiceEvent<Ws.Request>, context: object): Promise<void>;
declare function handle(request: Ws.Incoming<Ws.Request>, context: object): Promise<Ws.Response | void>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const request: Ws.Incoming<Ws.Request> = {
    timestamp: new Date(requestContext.requestTimeEpoch),
    connectionId: requestContext.connectionId,
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    const traceId = getRandomUUID();

    Object.assign(request, {
      ...(await getIncomingRequest(event)),
      traceId
    });

    Runtime.setScope({
      traceId
    });

    await onReady(request);

    const response = await handle(request, __EZ4_CONTEXT);

    await onDone(request);

    if (response?.body) {
      return getSuccessResponse(response.body);
    }

    return getSuccessResponse();
    //
  } catch (error) {
    await onError(error, request);

    if (error instanceof HttpError) {
      return getErrorResponse(error);
    }

    return getErrorResponse();
    //
  } finally {
    await onEnd(request);
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    identity: __EZ4_IDENTITY_SCHEMA ? await getIncomingRequestIdentity(event) : undefined,
    body: __EZ4_BODY_SCHEMA ? await getIncomingRequestBody(event) : undefined
  };
};

const getIncomingRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  const identity = event.requestContext?.authorizer?.identity;

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

const getOutgoingResponseBody = (body: Ws.JsonBody | Ws.RawBody) => {
  if (!__EZ4_RESPONSE_SCHEMA) {
    return undefined;
  }

  if (isScalarSchema(__EZ4_RESPONSE_SCHEMA)) {
    return {
      body: Buffer.from(body.toString(), 'utf-8').toString('base64'),
      isBase64Encoded: true
    };
  }

  const payload = resolveResponseBody(body, __EZ4_RESPONSE_SCHEMA, __EZ4_PREFERENCES);

  return {
    body: JSON.stringify(payload),
    isBase64Encoded: false
  };
};

const getSuccessResponse = (body?: Ws.JsonBody | Ws.RawBody) => {
  return {
    statusCode: 200,
    ...(body && getOutgoingResponseBody(body))
  };
};

const getErrorResponse = (error?: HttpError) => {
  const { status, body } = getJsonError(error ?? new HttpInternalServerError());

  return {
    statusCode: status,
    body: JSON.stringify(body)
  };
};

const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
  return resolveValidation(value, __EZ4_CONTEXT, context.type);
};

const onBegin = async (request: Ws.Incoming<Ws.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Ws.Incoming<Ws.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Ws.Incoming<Ws.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Ws.Incoming<Ws.Request>) => {
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

const onEnd = async (request: Ws.Incoming<Ws.Request>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
