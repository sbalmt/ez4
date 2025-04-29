import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerWithContextResult, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

import { getHeaders, getPathParameters, getQueryStrings } from '@ez4/aws-gateway/runtime';
import { ServiceEventType } from '@ez4/common';

type RequestEvent = APIGatewayRequestAuthorizerEventV2;
type ResponseEvent = APIGatewaySimpleAuthorizerWithContextResult<any>;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(request: Http.Incoming<Http.AuthRequest>, context: object): Promise<Http.AuthResponse>;
declare function dispatch(event: Service.Event<Http.Incoming<Http.AuthRequest>>, context: object): Promise<void>;

/**
 * Entrypoint to handle API Gateway authorizations.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  let lastRequest: Http.Incoming<Http.AuthRequest> | undefined;

  const { requestContext } = event;

  const request = {
    requestId: context.awsRequestId,
    timestamp: new Date(requestContext.timeEpoch),
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

    const { identity } = await handle(lastRequest, __EZ4_CONTEXT);

    return {
      isAuthorized: !!identity,
      context: {
        identity: JSON.stringify(identity ?? {})
      }
    };
  } catch (error) {
    await onError(error, lastRequest ?? request);

    return {
      isAuthorized: false,
      context: undefined
    };
  } finally {
    await onEnd(request);
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA ? await getRequestHeaders(event) : undefined,
    parameters: __EZ4_PARAMETERS_SCHEMA ? await getRequestParameters(event) : undefined,
    query: __EZ4_QUERY_SCHEMA ? await getRequestQuery(event) : undefined
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

const getRequestQuery = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    return getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};

const onBegin = async (request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  return dispatch(
    {
      type: ServiceEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const onReady = async (request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  return dispatch(
    {
      type: ServiceEventType.Ready,
      request
    },
    __EZ4_CONTEXT
  );
};

const onError = async (error: Error, request: Partial<Http.Incoming<Http.AuthRequest>>) => {
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

const onEnd = async (request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  return dispatch(
    {
      type: ServiceEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
