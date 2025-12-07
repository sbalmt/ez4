import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Http } from '../http/contract';
import type { WsConnect, WsDisconnect } from './connect';
import type { WsEmptyRequest } from './utils';
import type { WsIncoming } from './incoming';
import type { WsListener } from './listener';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsHandler } from './handler';
import type { WsMessage } from './message';
import type { WsEvent } from './event';
import type { WsData } from './data';

/**
 * Provide all contracts for a self-managed WS service.
 */
export namespace Ws {
  export type Data = WsData;

  export type Request = WsRequest;
  export type Response = WsResponse;
  export type Event = WsEvent;

  export type Incoming<T extends Request | Event> = WsIncoming<T>;

  export type Listener<T extends Request | Event> = WsListener<T>;
  export type Handler<T extends Request | Event> = WsHandler<T>;

  export type Connect<T extends Request = Request, U extends Http.AuthRequest = Http.AuthRequest> = WsConnect<T, U>;
  export type Disconnect<T extends Request = Request> = WsDisconnect<T>;
  export type Message<T extends Event = Event> = WsMessage<T>;

  export type ServiceEvent<T extends Request | Event = Event> = CommonService.AnyEvent<Incoming<T>>;

  export type EmptyRequest = WsEmptyRequest;

  /**
   * WS Connect event definition.
   */
  export type UseConnect<T extends Connect<any, any>> = T;

  /**
   * WS Disconnect event definition.
   */
  export type UseDisconnect<T extends Disconnect<any>> = T;

  /**
   * WS Message event definition.
   */
  export type UseMessage<T extends Message<any>> = T;

  /**
   * WS service.
   */
  export declare abstract class Service<T extends Data> implements CommonService.Provider {
    /**
     * All connection events.
     */
    abstract readonly connect: Connect<any, any>;

    /**
     * All disconnection events.
     */
    abstract readonly disconnect: Disconnect<any>;

    /**
     * All message events.
     */
    abstract readonly message: Message<any>;

    /**
     * Schema route key.
     */
    abstract readonly routeKey: keyof T;

    /**
     * Event schema.
     */
    readonly schema: T;

    /**
     * Display name for the service.
     */
    readonly name?: string;

    /**
     * Variables associated to all routes.
     */
    readonly variables?: LinkedVariables;

    /**
     * Service client.
     */
    readonly client: never;
  }
}
