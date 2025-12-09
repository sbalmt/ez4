import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { HttpPreferences } from '@ez4/gateway/library';
import type { Ws } from '@ez4/gateway';

import type {
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyWithLambdaAuthorizerEvent,
  APIGatewayProxyResultV2,
  Context
} from 'aws-lambda';

import * as GatewayUtils from '@ez4/gateway/utils';

import { ServiceEventType } from '@ez4/common';

type RequestEvent = APIGatewayProxyEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2> &
  APIGatewayProxyWithLambdaAuthorizerEvent<any>;

type ResponseEvent = APIGatewayProxyResultV2;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_PREFERENCES: HttpPreferences;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Ws.ServiceEvent<Ws.Event>, context: object): Promise<void>;
declare function handle(request: Ws.Incoming<Ws.Event>, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const request: Ws.Incoming<Ws.Event> = {
    timestamp: new Date(requestContext.requestTimeEpoch),
    connectionId: requestContext.connectionId,
    requestId: context.awsRequestId
  };

  try {
    await onBegin(request);

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    await handle(request, __EZ4_CONTEXT);

    await onDone(request);

    return {
      statusCode: 204
    };

    //
  } catch (error) {
    await onError(error, request);

    return {
      statusCode: 500
    };

    //
  } finally {
    await onEnd(request);
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA ? await getIncomingRequestHeaders(event) : undefined,
    query: __EZ4_QUERY_SCHEMA ? await getIncomingRequestQueryStrings(event) : undefined,
    identity: __EZ4_IDENTITY_SCHEMA ? await getIncomingRequestIdentity(event) : undefined
  };
};

const getIncomingRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    return GatewayUtils.getHeaders(event.headers ?? {}, __EZ4_HEADERS_SCHEMA);
  }

  return undefined;
};

const getIncomingRequestQueryStrings = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return GatewayUtils.getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA, __EZ4_PREFERENCES);
  }

  return undefined;
};

const getIncomingRequestIdentity = (event: RequestEvent) => {
  if (!__EZ4_IDENTITY_SCHEMA) {
    return undefined;
  }

  const identity = event.requestContext?.authorizer?.identity;

  return GatewayUtils.getIdentity(JSON.parse(identity ?? '{}'), __EZ4_IDENTITY_SCHEMA);
};

const onBegin = async (request: Ws.Incoming<Ws.Event>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Ws.Incoming<Ws.Event>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: Ws.Incoming<Ws.Event>) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: Ws.Incoming<Ws.Event>) => {
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

const onEnd = async (request: Ws.Incoming<Ws.Event>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
