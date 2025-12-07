import type { LinkedVariables } from '@ez4/project/library';
import type { HttpAuthorizer, HttpAuthRequest } from '../http/common';
import type { WebPreferences } from '../preferences';
import type { WsListener } from './listener';
import type { WsRequest } from './request';
import type { WsHandler } from './handler';

/**
 * WS connect event.
 */
export interface WsConnect<T extends WsRequest, U extends HttpAuthRequest> {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<T | U>;

  /**
   * Authorizer function for the event.
   */
  readonly authorizer?: HttpAuthorizer<U>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<T>;

  /**
   * Target preference options.
   */
  readonly preferences?: WebPreferences;

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

/**
 * WS disconnect event.
 */
export interface WsDisconnect<T extends WsRequest> {
  /**
   * Life-cycle listener function for the event.
   */
  readonly listener?: WsListener<T>;

  /**
   * Entry-point handler function for the event.
   */
  readonly handler: WsHandler<T>;

  /**
   * Target preference options.
   */
  readonly preferences?: WebPreferences;

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
