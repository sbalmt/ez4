import type { Environment } from '@ez4/common';
import type { Architecture, Ws } from '@ez4/gateway';
import type { HelloQueue } from './queues/hello';
import type { tokenAuthorizer } from './authorizers/token';
import type { connectHandler } from './events/connect';
import type { disconnectHandler } from './events/disconnect';
import type { messageHandler } from './events/message';
import type { AllMessages } from './types/messages';

/**
 * Example of AWS WebSocket API deployed with EZ4.
 */
export declare class WsApi extends Ws.Service<AllMessages> {
  /**
   * Display name for this API.
   */
  name: 'AWS WebSocket';

  /**
   * Optionally redefine default stage name.
   */
  stage: 'ez4-websocket';

  /**
   * Default options for all handlers.
   */
  defaults: Ws.UseDefaults<{
    /**
     * Use ARM64 architecture.
     */
    architecture: Architecture.Arm;
  }>;

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

  /**
   * Services injected to all WS handlers.
   */
  services: {
    helloQueue: Environment.Service<HelloQueue>;
    selfClient: Environment.Service<WsApi>;
  };
}
