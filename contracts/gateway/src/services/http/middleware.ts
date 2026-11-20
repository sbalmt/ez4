import type { HttpHandler } from './handler';
import type { HttpRequest } from './request';

/**
 * HTTP route middleware.
 */
export type HttpMiddleware<T extends HttpRequest> = (next: HttpHandler<T>) => HttpHandler<T>;
