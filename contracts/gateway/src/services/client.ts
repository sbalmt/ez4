import type { AnyObject, Prettify } from '@ez4/utils';
import type { Http } from './contract';

/**
 * HTTP client.
 */
export type Client<T extends Http.Service> = {
  [P in ClientRoutes<T> as P extends { name: infer N } ? (N extends string ? N : never) : never]: P extends {
    handler: infer H;
    authorizer: infer A;
  }
    ? AuthorizedClientOperation<H, A>
    : P extends { handler: infer H }
      ? ClientOperation<H>
      : never;
};

/**
 * Default HTTP client request.
 */
export type ClientRequest = RequestOptions & {
  readonly headers?: Record<string, string>;
  readonly parameters?: Record<string, string>;
  readonly query?: Record<string, unknown>;
  readonly body?: string | AnyObject;
};

/**
 * Default HTTP response.
 */
export type ClientResponse = {
  readonly status: number;
  readonly headers?: Record<string, string | undefined>;
  readonly body?: unknown;
};

/**
 * Given a HTTP service `T`, it produces a union type containing all gateway routes.
 */
type ClientRoutes<T extends Http.Service> = T extends { routes: (infer R)[] } ? R : never;

/**
 * Given a handler type `T`, it produces a callback to invoke the operation.
 */
type ClientOperation<T> = T extends (...args: any) => any ? (request: OperationRequest<T>) => OperationResponse<T> : never;

/**
 * Given a handler type `T`, it produces a request type.
 */
type OperationRequest<T extends (...args: any) => any> = Prettify<RequestSchema<Parameters<T>[0]> & RequestOptions>;

/**
 * Given a handler type `T`, it produces a callback to invoke the operation.
 */
type AuthorizedClientOperation<T, U> = T extends (...args: any) => any
  ? U extends (...args: any) => any
    ? (request: AuthorizedOperationRequest<T, U>) => OperationResponse<T>
    : never
  : never;

/**
 * Given a handler type `T`, it produces a request type.
 */
type AuthorizedOperationRequest<T extends (...args: any) => any, U extends (...args: any) => any> = Prettify<
  RequestSchema<Parameters<T>[0]> & RequestSchema<Parameters<U>[0]> & RequestOptions
>;

/**
 * Given a handler type `T`, it produces a response type.
 */
type OperationResponse<T extends (...args: any) => any> = Promise<Awaited<ReturnType<T>>>;

/**
 * Given a request type `T`, it produces a request schema containing only valid parameters.
 */
type RequestSchema<T> = T extends AnyObject
  ? { [P in keyof T as P extends 'parameters' | 'headers' | 'query' | 'body' ? P : never]: T[P] }
  : never;

/**
 * All request options.
 */
type RequestOptions = {
  /**
   * Maximum wait time for a response.
   */
  readonly timeout?: number;
};
