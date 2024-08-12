import type { ArrayRest, IsArrayEmpty, IsAny } from '@ez4/utils';
import type { Http } from './http.js';

/**
 * Given an array of requests `T` and an union of responses `U`, it returns an union of
 * `Http.Route` for each request.
 */
export type RouteTypes<T extends Http.Request[], U extends Http.Response> =
  IsAny<T> extends true
    ? any
    : IsArrayEmpty<T> extends true
      ? Http.Route<Http.Request, U>
      : Http.Route<T[0], U> | RouteTypes<ArrayRest<T>, U>;
