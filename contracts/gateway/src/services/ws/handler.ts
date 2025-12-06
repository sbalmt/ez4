import type { Service } from '@ez4/common';
import type { HttpJsonBody } from '../common';
import type { Ws } from '../ws';
import type { WsIncoming } from './incoming';

/**
 * WS request handler.
 */
export type WsHandler<T extends HttpJsonBody | null> = (
  request: WsIncoming<T>,
  context: Service.Context<Ws.Service<any>>
) => Promise<void> | void;
