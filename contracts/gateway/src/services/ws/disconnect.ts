import type { LinkedVariables } from '@ez4/project/library';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';

/**
 * WS disconnect event.
 */
export interface WsDisconnect {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<null>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<null>;

  /**
   * Default log retention (in days) for the handlers.
   */
  readonly logRetention?: number;

  /**
   * Variables associated to the event.
   */
  readonly variables?: LinkedVariables;

  /**
   * Max execution time (in seconds) for the event.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;
}
