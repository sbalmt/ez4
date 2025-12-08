import type { AnyObject, IsObjectEmpty, OptionalProperties, Prettify } from '@ez4/utils';
import type { Http } from './contract';

/**
 * HTTP client.
 */
export type HttpClient<T extends Http.Service | Http.Import<any>> = {
  [P in ClientRoutes<T> as P extends { name: infer N } ? (N extends string ? N : never) : never]: P extends {
    handler: infer H;
    authorizer: infer A;
  }
    ? AuthorizedClientOperation<H, A, AuthorizationHeaderName<T>>
    : P extends { handler: infer H }
      ? ClientOperation<H>
      : never;
};

/**
 * Default HTTP client request.
 */
export type HttpClientRequest = RequestOptions & {
  readonly headers?: Record<string, string>;
  readonly parameters?: Record<string, string>;
  readonly query?: Record<string, unknown>;
  readonly body?: string | AnyObject;
};

/**
 * Default HTTP response.
 */
export type HttpClientResponse = {
  readonly status: number;
  readonly headers?: Record<string, string | undefined>;
  readonly body?: unknown;
};

/**
 * Given a HTTP service `H`, it produces a union type containing all gateway routes.
 */
type ClientRoutes<H extends Http.Service> = H extends { routes: (infer R)[] } ? R : never;

/**
 * Given a handler type `H`, it produces a callback to invoke the operation.
 */
type ClientOperation<H> = H extends (...args: any) => any ? (request: OperationRequest<H>) => OperationResponse<H> : never;

/**
 * Given a handler type `H`, it produces a request type.
 */
type OperationRequest<H extends (...args: any) => any> = Prettify<RequestSchema<Parameters<H>[0], never> & RequestOptions>;

/**
 * Given a service type `T`, it returns the authorization header name.
 */
type AuthorizationHeaderName<T extends Http.Service | Http.Import<any>> = T extends { authorization: infer A }
  ? A extends { header: infer H }
    ? H
    : 'authorization'
  : never;

/**
 * Given a handler type `H` and an authorizer type `A`, it produces a callback to invoke the authorized operation.
 */
type AuthorizedClientOperation<H, A, N extends string> = H extends (...args: any) => any
  ? A extends (...args: any) => any
    ? (request: AuthorizedOperationRequest<H, A, N>) => OperationResponse<H>
    : never
  : never;

/**
 * Given a handler type `H` and an authorized type `A`, it produces a request type for the authorized request.
 */
type AuthorizedOperationRequest<H extends (...args: any) => any, A extends (...args: any) => any, N extends string> = Prettify<
  RequestSchema<Parameters<H>[0], never> & RequestSchema<Parameters<A>[0], N> & RequestOptions
>;

/**
 * Given a handler type `H`, it produces a response type.
 */
type OperationResponse<H extends (...args: any) => any> = Promise<Awaited<ReturnType<H>>>;

/**
 * Given a request type `R`, it produces a request schema containing only valid parameters.
 */
type RequestSchema<R, H extends string> = R extends AnyObject
  ? RequestHeaders<R, H> & RequestParameters<R> & RequestQuery<R> & RequestBody<R>
  : never;

/**
 * Given a request type `R`, it produces a request headers type.
 */
type RequestHeaders<R, H extends string> = R extends { headers: infer T }
  ? IsObjectEmpty<Omit<T, H>> extends false
    ? { readonly headers: Prettify<Omit<T, H>> }
    : {}
  : {};

/**
 * Given a request type `R`, it produces a request parameters type.
 */
type RequestParameters<R> = R extends { parameters: infer T }
  ? IsObjectEmpty<Omit<T, OptionalProperties<NonNullable<T>>>> extends true
    ? { readonly parameters?: T }
    : { readonly parameters: T }
  : {};

/**
 * Given a request type `R`, it produces a request query type.
 */
type RequestQuery<R> = R extends { query: infer T }
  ? IsObjectEmpty<Omit<T, OptionalProperties<NonNullable<T>>>> extends true
    ? { readonly query?: T }
    : { readonly query: T }
  : {};

/**
 * Given a request type `R`, it produces a request body type.
 */
type RequestBody<R> = R extends { body: infer T }
  ? IsObjectEmpty<Omit<T, OptionalProperties<NonNullable<T>>>> extends true
    ? { readonly body?: T }
    : { readonly body: T }
  : {};

/**
 * All request options.
 */
type RequestOptions = {
  /**
   * Maximum wait time for a response.
   */
  readonly timeout?: number;
};
