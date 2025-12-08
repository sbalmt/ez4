import type { Service } from '@ez4/common';
import type { HttpProvider } from './provider';
import type { HttpIncoming } from './incoming';
import type { HttpResponse } from './response';
import type { HttpRequest } from './request';
import type { Http } from './contract';

/**
 * HTTP request handler.
 */
export type HttpHandler<T extends HttpRequest> = (
  request: HttpIncoming<T> | T,
  context: Service.Context<Http.Service | HttpProvider>
) => Promise<HttpResponse> | HttpResponse;
