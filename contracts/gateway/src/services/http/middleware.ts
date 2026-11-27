import type { Service } from '@ez4/common';
import type { HttpHandler } from './handler';
import type { HttpRequest } from './request';
import type { HttpProvider } from './provider';
import type { Http } from './contract';

/**
 * HTTP route middleware.
 */
export type HttpMiddleware<T extends HttpRequest> = (
  next: HttpHandler<T>,
  context: Service.Context<Http.Service | HttpProvider>
) => HttpHandler<T>;
