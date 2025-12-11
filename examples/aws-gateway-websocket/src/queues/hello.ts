import type { Environment, Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { WsApi } from '../ws';

import { MessageType } from '../types/messages';

type HelloMessage = {
  connectionId: string;
  userId: string;
};

/**
 * Example of AWS SQS deployed with EZ4.
 */
export declare class HelloQueue extends Queue.Service<HelloMessage> {
  /**
   * Enable dead-letter queue.
   */
  deadLetter: Queue.UseDeadLetter<{
    /**
     * After 3 retries, the message will be sent to the dead-letter.
     */
    maxRetries: 3;
  }>;

  /**
   * All handlers for this queue (When more than one subscription is set, they are chosen randomly).
   */
  subscriptions: [
    Queue.UseSubscription<{
      /**
       * Message handler.
       */
      handler: typeof messageHandler;

      /**
       * Allow up to 2 lambdas concurrently.
       */
      concurrency: 2;
    }>
  ];

  /**
   * Expose WS client to the handler.
   */
  services: {
    wsApiClient: Environment.Service<WsApi>;
  };
}

/**
 * Handle all `hello` messages from the queue.
 */
export async function messageHandler(request: Queue.Incoming<HelloMessage>, context: Service.Context<HelloQueue>) {
  const { connectionId, userId } = request.message;
  const { wsApiClient } = context;

  await wsApiClient.sendMessage(connectionId, {
    message: `Hello ${userId}, welcome to the WebSocket example`,
    type: MessageType.Welcome
  });
}
