import type { Ws } from '@ez4/gateway';
import type { tokenAuthorizer } from './authorizers/token';
import type { connectHandler } from './events/connect';
import type { disconnectHandler } from './events/disconnect';
import type { messageHandler } from './events/message';
import type { AllEvents } from './types';

/**
 * Example of AWS WebSocket API deployed with EZ4.
 */
export declare class Api extends Ws.Service<AllEvents> {
  /**
   * Display name for this API.
   */
  name: 'AWS WebSocket';

  /**
   * Define the routing key from the event schema.
   */
  routeKey: 'type';

  /**
   * Define the connection handler.
   */
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    authorizer: typeof tokenAuthorizer;
  }>;

  /**
   * Define the disconnection handler.
   */
  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  /**
   * Define the message handler.
   */
  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}
