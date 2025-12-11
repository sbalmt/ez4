import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { AuthResponse as WsAuthResponse } from '../auth/response';
import type { AuthRequest as WsAuthRequest } from '../auth/request';
import type { WebJsonBody, WebRawBody } from '../web/body';
import type { WebPreferences } from '../web/preferences';
import type { AuthIdentity } from '../auth/identity';
import type { WebQueryStrings } from '../web/query';
import type { WebHeaders } from '../web/headers';
import type { WsEmptyEvent, WsEmptyRequest } from './utils';
import type { WsDisconnect } from './disconnect';
import type { WsDefaults } from './defaults';
import type { WsIncoming } from './incoming';
import type { WsListener } from './listener';
import type { WsResponse } from './response';
import type { WsRequest } from './request';
import type { WsHandler } from './handler';
import type { WsMessage } from './message';
import type { WsConnect } from './connect';
import type { WsClient } from './client';
import type { WsEvent } from './event';

/**
 * Provide all contracts for a self-managed WS service.
 */
export namespace Ws {
  export type Headers = WebHeaders;
  export type Identity = AuthIdentity;

  export type QueryStrings = WebQueryStrings;
  export type JsonBody = WebJsonBody;
  export type RawBody = WebRawBody;

  export type Preferences = WebPreferences;

  export type Request = WsRequest;
  export type Response = WsResponse;
  export type Event = WsEvent;

  export type AuthRequest = WsAuthRequest;
  export type AuthResponse = WsAuthResponse;

  export type Incoming<T extends Request | Event> = WsIncoming<T>;

  export type Listener<T extends Request | Event> = WsListener<T>;
  export type Handler<T extends Request | Event> = WsHandler<T>;

  export type Connect<T extends Event = Event, U extends AuthRequest = AuthRequest> = WsConnect<T, U>;
  export type Disconnect<T extends Event = Event> = WsDisconnect<T>;
  export type Message<T extends Request = Request> = WsMessage<T>;

  export type Defaults<T extends Request | Event = any> = WsDefaults<T>;

  export type ServiceEvent<T extends Request | Event = Event> = CommonService.AnyEvent<Incoming<T>>;

  export type EmptyRequest = WsEmptyRequest;
  export type EmptyEvent = WsEmptyEvent;

  /**
   * WS Defaults definition.
   */
  export type UseDefaults<T extends Defaults<any>> = T;

  /**
   * WS Preferences definition.
   */
  export type UsePreferences<T extends Preferences> = T;

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
  export declare abstract class Service<T extends JsonBody> implements CommonService.Provider {
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
     * Default gateway parameters.
     */
    readonly defaults?: Defaults<any>;

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
    readonly client: WsClient<T>;
  }
}
