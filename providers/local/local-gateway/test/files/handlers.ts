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
