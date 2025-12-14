import type { Service } from '@ez4/common';
import type { HttpProvider } from './provider';
import type { HttpIncoming } from './incoming';
import type { HttpRequest } from './request';
import type { Http } from './contract';

/**
 * HTTP request listener.
 */
export type HttpListener<T extends HttpRequest> = (
  event: Service.AnyEvent<HttpIncoming<T>>,
  context: Service.Context<Http.Service | HttpProvider>
) => Promise<void> | void;
