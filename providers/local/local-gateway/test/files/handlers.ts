import type { AnyObject } from '@ez4/utils';

import { HttpNotFoundError } from '@ez4/gateway';

export class CustomError extends Error {}

/**
 * Authorizer to test the identity resolution.
 */
export const authorizer = ({ headers }: AnyObject) => {
  return {
    identity: {
      user: headers.authorization
    }
  };
};

/**
 * Handler to test the HTTP request preparation.
 */
export const request = ({ parameters, query, body, identity }: AnyObject) => {
  return {
    status: 200,
    body: {
      id: parameters?.id,
      page: query?.page,
      name: body?.name,
      user: identity?.user
    }
  };
};

/**
 * Handler to test HTTP errors thrown inside the worker.
 */
export const notFound = () => {
  throw new HttpNotFoundError('Resource not found.', { resource: 'test' });
};

/**
 * Handler to test custom errors mapped to HTTP errors.
 */
export const customError = () => {
  throw new CustomError('Custom failure.');
};

export const unexpectedError = () => {
  throw new Error('Unexpected failure.');
};

/**
 * Handler to assert middleware execution order.
 */
export const middlewareResult = () => {
  return {
    status: 200,
    body: {
      order: ['handler']
    }
  };
};

type GatewayHandler = (request: AnyObject, context: AnyObject) => unknown;

/**
 * Default middleware used to assert outer execution ordering.
 */
export const defaultMiddleware = (next: GatewayHandler): GatewayHandler => {
  return async (request, context) => {
    const response = (await next(request, context)) as AnyObject;

    if (!Array.isArray(response.body?.order)) {
      return response;
    }

    return {
      ...response,
      body: {
        ...response.body,
        order: ['default:before', ...response.body.order, 'default:after']
      }
    };
  };
};

/**
 * Route middleware used to assert inner execution ordering.
 */
export const routeMiddleware = (next: GatewayHandler): GatewayHandler => {
  return async (request, context) => {
    const response = (await next(request, context)) as AnyObject;

    return {
      ...response,
      body: {
        ...response.body,
        order: ['route:before', ...response.body.order, 'route:after']
      }
    };
  };
};

/**
 * Handler to test the WS connection.
 */
export const connection = () => {};

/**
 * Handler to test the WS message and client.
 */
export const message = async ({ connectionId, body }: AnyObject, { ws }: AnyObject) => {
  await ws.sendMessage(connectionId, {
    echo: body.text
  });

  return {
    body: {
      text: body.text
    }
  };
};
