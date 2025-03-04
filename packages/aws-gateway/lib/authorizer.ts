import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult,
  Context
} from 'aws-lambda';

import { getHeaders, getPathParameters, getQueryStrings } from '@ez4/aws-gateway/runtime';

type RequestEvent = APIGatewayRequestAuthorizerEventV2;
type ResponseEvent = APIGatewaySimpleAuthorizerWithContextResult<any>;

declare function next(request: Http.Incoming<any>, context: object): Promise<Http.AuthResponse>;
declare function fail(error: Error, request: Http.Incoming<any>, context: object): Promise<void>;

declare const __EZ4_HEADERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle API Gateway authorizations.
 */
export async function apiEntryPoint(event: RequestEvent, context: Context): Promise<ResponseEvent> {
  const { requestContext } = event;

  const request = {
    requestId: context.awsRequestId,
    timestamp: new Date(requestContext.timeEpoch),
    method: requestContext.http.method,
    path: requestContext.http.path
  };

  try {
    Object.assign(request, await getIncomingRequest(event));

    const { identity } = await next(request, __EZ4_CONTEXT);

    return {
      isAuthorized: !!identity,
      context: {
        identity: JSON.stringify(identity ?? {})
      }
    };
  } catch (error) {
    console.error(error);

    fail(error, request, context);

    return {
      isAuthorized: false,
      context: undefined
    };
  }
}

const getIncomingRequest = async (event: RequestEvent) => {
  return {
    headers: __EZ4_HEADERS_SCHEMA && (await getRequestHeaders(event)),
    parameters: __EZ4_PARAMETERS_SCHEMA && (await getRequestParameters(event)),
    query: __EZ4_QUERY_SCHEMA && (await getRequestQuery(event))
  };
};

const getRequestHeaders = (event: RequestEvent) => {
  if (__EZ4_HEADERS_SCHEMA) {
    const rawHeaders = event.headers ?? {};
    return getHeaders(rawHeaders, __EZ4_HEADERS_SCHEMA);
  }

  return undefined;
};

const getRequestParameters = (event: RequestEvent) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    const rawParameters = event.pathParameters ?? {};
    return getPathParameters(rawParameters, __EZ4_PARAMETERS_SCHEMA);
  }

  return undefined;
};

const getRequestQuery = (event: RequestEvent) => {
  if (__EZ4_QUERY_SCHEMA) {
    const rawQuery = event.queryStringParameters ?? {};
    return getQueryStrings(rawQuery, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};
