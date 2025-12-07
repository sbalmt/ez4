import type { LinkedVariables } from '@ez4/project/library';
import type { WsListener } from './listener';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';

/**
 * WS message event.
 */
export interface WsMessage<T extends WsEvent> {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<T>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<T>;

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
