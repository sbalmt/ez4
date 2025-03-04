import type { Service } from '@ez4/common';
import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult,
  Context
} from 'aws-lambda';

import { getHeaders, getPathParameters, getQueryStrings } from '@ez4/aws-gateway/runtime';
import { WatcherEventType } from '@ez4/common';

type RequestEvent = APIGatewayRequestAuthorizerEventV2;
type ResponseEvent = APIGatewaySimpleAuthorizerWithContextResult<any>;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

declare function handle(
  request: Http.Incoming<Http.AuthRequest>,
  context: object
): Promise<Http.AuthResponse>;

declare function watch(
  event: Service.WatcherEvent<Http.Incoming<Http.AuthRequest>>,
  context: object
): Promise<void>;

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
    await watchBegin(request);

    const incomingRequest = await getIncomingRequest(event);

    lastRequest = {
      ...request,
      ...incomingRequest
    };

    const { identity } = await handle(lastRequest, __EZ4_CONTEXT);

    return {
      isAuthorized: !!identity,
      context: {
        identity: JSON.stringify(identity ?? {})
      }
    };
  } catch (error) {
    await watchError(error, lastRequest ?? request);

    return {
      isAuthorized: false,
      context: undefined
    };
  } finally {
    await watchEnd(request);
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

const watchBegin = async (request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  return watch(
    {
      type: WatcherEventType.Begin,
      request
    },
    __EZ4_CONTEXT
  );
};

const watchError = async (error: Error, request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  console.error(error);

  return watch(
    {
      type: WatcherEventType.Error,
      request,
      error
    },
    __EZ4_CONTEXT
  );
};

const watchEnd = async (request: Partial<Http.Incoming<Http.AuthRequest>>) => {
  return watch(
    {
      type: WatcherEventType.End,
      request
    },
    __EZ4_CONTEXT
  );
};
