import type { ValidationCustomContext } from '@ez4/validator';
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

import { ApiGatewayManagementApiClient, PostToConnectionCommand, DeleteConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

import { resolveHeaders, resolveIdentity, resolveQueryStrings, resolveValidation } from '@ez4/gateway/utils';
import { ServiceEventType, Runtime } from '@ez4/common';
import { getRandomUUID } from '@ez4/utils';

type RequestEvent = APIGatewayProxyEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2> &
  APIGatewayProxyWithLambdaAuthorizerEvent<any>;

type ResponseEvent = APIGatewayProxyResultV2;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_IDENTITY_SCHEMA: ObjectSchema | UnionSchema | null;
declare const __EZ4_PREFERENCES: HttpPreferences;
declare const __EZ4_CONTEXT: object;
declare const __EZ4_WS_ERROR_FORWARDING: boolean;

declare function dispatch(event: Ws.ServiceEvent<Ws.Event>, context: object): Promise<void>;
declare function handle(request: Ws.Incoming<Ws.Event>, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const traceId = event.headers['x-trace-id'] ?? getRandomUUID();

  const request: Ws.Incoming<Ws.Event> = {
    timestamp: new Date(requestContext.requestTimeEpoch),
    connectionId: requestContext.connectionId,
    requestId: context.awsRequestId,
    traceId
  };

  Runtime.setScope({
    traceId
  });

  if (__EZ4_WS_ERROR_FORWARDING) {
    const authError = getAuthError(event);

    if (authError) {
      await sendAuthError(event, authError);

      return {
        statusCode: authError.code,
        headers: {
          ['x-trace-id']: traceId
        }
      };
    }
  }

  try {
    await onBegin(request);

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    await handle(request, __EZ4_CONTEXT);

    await onDone(request);

    return {
      statusCode: 204,
      headers: {
        ['x-trace-id']: traceId
      }
    };

    //
  } catch (error) {
    await onError(error, request);

    return {
      statusCode: 500,
      headers: {
        ['x-trace-id']: traceId
      }
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
    return resolveHeaders(event.headers ?? {}, __EZ4_HEADERS_SCHEMA, onCustomValidation);
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

  const identity = event.requestContext?.authorizer?.identity;

  return resolveIdentity(JSON.parse(identity ?? '{}'), __EZ4_IDENTITY_SCHEMA, onCustomValidation);
};

const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
  return resolveValidation(value, __EZ4_CONTEXT, context.type);
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

const onEnd = async (request: Ws.Incoming<Ws.Event>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};

const getAuthError = (event: RequestEvent) => {
  const authorizer = event.requestContext?.authorizer;

  if (!authorizer?.__ez4_auth_error) {
    return undefined;
  }

  return {
    message: String(authorizer.__ez4_auth_error),
    code: Number(authorizer.__ez4_auth_code) || 4500
  };
};

const sendAuthError = async (event: RequestEvent, error: { message: string; code: number }) => {
  const { domainName, stage, connectionId } = event.requestContext;

  const client = new ApiGatewayManagementApiClient({
    endpoint: `https://${domainName}/${stage}`
  });

  try {
    await client.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(
          JSON.stringify({
            type: 'error',
            message: error.message,
            code: error.code
          })
        )
      })
    );
  } catch {
    // Connection may already be gone
  }

  try {
    await client.send(
      new DeleteConnectionCommand({
        ConnectionId: connectionId
      })
    );
  } catch {
    // Connection may already be gone
  }
};
