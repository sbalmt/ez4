import type { ObjectSchema } from '@ez4/schema';
import type { Queue } from '@ez4/queue';

import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getJsonMessage } from '@ez4/aws-queue/runtime';

const client = new SQSClient({});

export namespace Client {
  export type ReceiveOptions = {
    maxMessages?: number;
    maxWait?: number;
  };

  export const make = <T extends Queue.Message>(
    queueUrl: string,
    messageSchema: ObjectSchema
  ): Queue.Client<T> => {
    return new (class {
      /**
       * Send a new JSON message to the queue.
       *
       * @param message Message object.
       */
      async sendMessage(message: T) {
        const safeMessage = await getJsonMessage(message, messageSchema);
        const rawMessage = JSON.stringify(safeMessage);

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: rawMessage
          })
        );
      }

      /**
       * Receive JSON messages from the queue.
       *
       * @param options Receive options.
       * @returns Returns a list containing zero or more messages.
       */
      async receiveMessage(options?: ReceiveOptions): Promise<T[]> {
        const response = await client.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: options?.maxMessages,
            WaitTimeSeconds: options?.maxWait
          })
        );

        const safeMessages = response.Messages!.map(({ Body }) => {
          return getJsonMessage(JSON.parse(Body!), messageSchema);
        });

        return await Promise.all(safeMessages);
      }
    })();
  };
}
