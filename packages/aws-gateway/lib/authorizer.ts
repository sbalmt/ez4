import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerWithContextResult, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

import * as GatewayUtils from '@ez4/gateway/utils';

import { ServiceEventType } from '@ez4/common';

type RequestEvent = APIGatewayRequestAuthorizerEventV2;
type ResponseEvent = APIGatewaySimpleAuthorizerWithContextResult<any>;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

declare function dispatch(event: Service.Event<Http.Incoming<Http.AuthRequest>>, context: object): Promise<void>;
declare function handle(request: Http.Incoming<Http.AuthRequest>, context: object): Promise<Http.AuthResponse>;

/**
 * Entrypoint to handle API Gateway authorizations.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const request: Http.Incoming<Http.AuthRequest> = {
    requestId: context.awsRequestId,
    timestamp: new Date(requestContext.timeEpoch),
    method: requestContext.http.method,
    path: requestContext.http.path
  };

  try {
    await onBegin(request);

    Object.assign(request, await getIncomingRequest(event));

    await onReady(request);

    const { identity } = await handle(request, __EZ4_CONTEXT);

    return {
      isAuthorized: !!identity,
      context: {
        identity: JSON.stringify(identity ?? {})
      }
    };
  } catch (error) {
    await onError(error, request);

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
    return GatewayUtils.getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA);
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
