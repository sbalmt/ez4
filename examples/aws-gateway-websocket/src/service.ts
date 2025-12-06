import type { Ws } from '@ez4/gateway';
import type { connectHandler } from './events/connect';
import type { disconnectHandler } from './events/disconnect';
import type { actionsHandler } from './events/actions';
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
   * Define the connection handler.
   */
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  /**
   * Define the disconnection handler.
   */
  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  /**
   * Define the data handler.
   */
  data: Ws.UseData<{
    handler: typeof actionsHandler;
  }>;
}
