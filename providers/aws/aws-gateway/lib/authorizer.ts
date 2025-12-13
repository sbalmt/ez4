import type { HttpPreferences } from '@ez4/gateway/library';
import type { ObjectSchema } from '@ez4/schema';
import type { Http, Ws } from '@ez4/gateway';

import type {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEventV2,
  APIGatewayRequestAuthorizerEvent,
  Context
} from 'aws-lambda';

import * as GatewayUtils from '@ez4/gateway/utils';

import { HttpForbiddenError, HttpUnauthorizedError } from '@ez4/gateway';
import { ServiceEventType } from '@ez4/common';
import { AnyObject } from '@ez4/utils';

type IncomingRequest = Http.Incoming<Http.AuthRequest> | Ws.Incoming<Ws.AuthRequest>;
type ServiceEvent = Http.ServiceEvent<Http.AuthRequest> | Ws.ServiceEvent<Ws.AuthRequest>;

type ResponseEvent = APIGatewayAuthorizerWithContextResult<any>;
type RequestEvent = APIGatewayRequestAuthorizerEvent & APIGatewayRequestAuthorizerEventV2;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_PREFERENCES: HttpPreferences;
declare const __EZ4_CONTEXT: object;

declare function handle(request: IncomingRequest, context: object): Promise<Http.AuthResponse>;
declare function dispatch(event: ServiceEvent, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway authorizations.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const resourceArn = event.methodArn ?? event.routeArn;

  const request: Http.Incoming<Http.AuthRequest> = {
    timestamp: new Date(requestContext.timeEpoch),
    requestId: context.awsRequestId,
    method: requestContext.http?.method,
    path: requestContext.http?.path
  };

  try {
    await onBegin(request);

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    const { identity } = await handle(request, __EZ4_CONTEXT);

    await onDone(request);

    return getAuthorizationResponse(!!identity, resourceArn, {
      identity: JSON.stringify(identity ?? {})
    });

    //
  } catch (error) {
    await onError(error, request);

    if (error instanceof HttpForbiddenError) {
      return getAuthorizationResponse(false, resourceArn);
    }

    if (error instanceof HttpUnauthorizedError) {
      throw 'Unauthorized';
    }

    throw error;
    //
  } finally {
    await onEnd(request);
  }
}

const getAuthorizationResponse = (authorized: boolean, resourceArn: string, context?: AnyObject): ResponseEvent => {
  return {
    context,
    principalId: 'me',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: authorized ? 'Allow' : 'Deny',
          Resource: resourceArn
        }
      ]
    }
  };
};

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA ? await getIncomingRequestHeaders(event) : undefined,
    parameters: __EZ4_PARAMETERS_SCHEMA ? await getIncomingRequestParameters(event) : undefined,
    query: __EZ4_QUERY_SCHEMA ? await getIncomingRequestQuery(event) : undefined
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

const getIncomingRequestQuery = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return GatewayUtils.getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA, __EZ4_PREFERENCES);
  }

  return undefined;
};

const onBegin = async (request: IncomingRequest) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: IncomingRequest) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onDone = async (request: IncomingRequest) => {
  return dispatch(
    {
      type: ServiceEventType.Done,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: unknown, request: IncomingRequest) => {
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

const onEnd = async (request: IncomingRequest) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
