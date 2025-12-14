import type { Ws } from './contract';

/**
 * WS client.
 */
export interface WsClient<T extends Ws.JsonBody> {
  /**
   * Send a new JSON message to the connection.
   *
   * @param connectionId Connection identifier.
   * @param message Message object.
   */
  sendMessage(connectionId: string, message: T): Promise<void>;

  /**
   * Terminate an active connection.
   *
   * @param connectionId Connection identifier.
   */
  disconnect(connectionId: string): Promise<void>;
}
