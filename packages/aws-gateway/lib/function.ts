import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import type { ObjectSchema } from '@ez4/schema';

import {
  formatJsonError,
  getQueryStrings,
  getPathParameters,
  getJsonBody
} from '@ez4/aws-gateway/runtime';

import { HttpError, HttpInternalServerError } from '@ez4/gateway';

declare function next(request: unknown, context: object): Promise<any>;

declare const __EZ4_QUERY_SCHEMA: ObjectSchema | null;
declare const __EZ4_PARAMETERS_SCHEMA: ObjectSchema | null;
declare const __EZ4_BODY_SCHEMA: ObjectSchema | null;
declare const __EZ4_CONTEXT: object;

/**
 * Entrypoint to handle API Gateway requests.
 */
export async function apiEntryPoint(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> {
  try {
    const request = {
      query: __EZ4_QUERY_SCHEMA && (await getRequestQuery(event)),
      parameters: __EZ4_PARAMETERS_SCHEMA && (await getRequestParameters(event)),
      body: __EZ4_BODY_SCHEMA && (await getRequestBody(event))
    };

    const response = await next(request, __EZ4_CONTEXT);

    const { status, body } = response;

    return formatJsonResponse(status, JSON.stringify(body));
  } catch (error) {
    if (!(error instanceof HttpError)) {
      error = new HttpInternalServerError(error.message);
    }

    console.error(error.message);

    return formatJsonResponse(error.status, formatJsonError(error));
  }
}

const getRequestQuery = (event: APIGatewayProxyEventV2) => {
  if (__EZ4_QUERY_SCHEMA) {
    return getQueryStrings(event.queryStringParameters ?? {}, __EZ4_QUERY_SCHEMA);
  }

  return undefined;
};

const getRequestParameters = (event: APIGatewayProxyEventV2) => {
  if (__EZ4_PARAMETERS_SCHEMA) {
    return getPathParameters(event.pathParameters ?? {}, __EZ4_PARAMETERS_SCHEMA);
  }

  return undefined;
};

const getRequestBody = (event: APIGatewayProxyEventV2) => {
  if (__EZ4_BODY_SCHEMA) {
    return getJsonBody(event.body ? JSON.parse(event.body) : {}, __EZ4_BODY_SCHEMA);
  }

  return undefined;
};

const formatJsonResponse = (status: number, body?: string) => {
  return {
    statusCode: status,
    ...(body && { body }),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
