import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Http } from '../http/contract';
import type { WsDisconnect } from './disconnect';
import type { WsIncoming } from './incoming';
import type { WsListener } from './listener';
import type { WsConnect } from './connect';
import type { WsHandler } from './handler';
import type { WsEvent } from './event';
import type { WsData } from './data';

/**
 * Provide all contracts for a self-managed WS service.
 */
export namespace Ws {
  export type Event = WsEvent;

  export type Incoming<T extends Event | null> = WsIncoming<T>;

  export type Listener<T extends Event | null> = WsListener<T>;
  export type Handler<T extends Event | null> = WsHandler<T>;

  export type Connect<T extends Http.Request = Http.Request, U extends Http.AuthRequest = Http.AuthRequest> = WsConnect<T, U>;
  export type Data<T extends Http.JsonBody = Http.JsonBody> = WsData<T>;
  export type Disconnect = WsDisconnect;

  export type ServiceEvent<T extends Event | null = null> = CommonService.AnyEvent<Incoming<T>>;

  /**
   * WS Connect event definition.
   */
  export type UseConnect<T extends Connect<any, any>> = T;

  /**
   * WS Disconnect event definition.
   */
  export type UseDisconnect<T extends Disconnect> = T;

  /**
   * WS Data event definition.
   */
  export type UseData<T extends Data<any>> = T;

  /**
   * WS service.
   */
  export declare abstract class Service<T extends Event> implements CommonService.Provider {
    /**
     * All connection events.
     */
    abstract readonly connect: Connect<any, any>;

    /**
     * All disconnection events.
     */
    abstract readonly disconnect: Disconnect;

    /**
     * All message events.
     */
    abstract readonly data: Data<any>;

    /**
     * Schema route key.
     */
    abstract readonly routeKey: keyof T;

    /**
     * Action schema.
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
