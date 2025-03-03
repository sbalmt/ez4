import type { Queue, ReceiveOptions, SendOptions, Client as SqsClient } from '@ez4/queue';
import type { MessageSchema } from '@ez4/aws-queue/runtime';

import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getJsonMessage, getJsonStringMessage } from '@ez4/aws-queue/runtime';

const client = new SQSClient({});

export namespace Client {
  export const make = <T extends Queue.Message>(
    queueUrl: string,
    messageSchema: MessageSchema
  ): SqsClient<T> => {
    return new (class {
      async sendMessage(message: T, options?: SendOptions) {
        const messageBody = await getJsonStringMessage(message, messageSchema);

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            DelaySeconds: options?.delay,
            MessageBody: messageBody
          })
        );
      }

      async receiveMessage(options?: ReceiveOptions): Promise<T[]> {
        const response = await client.send(
          new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: options?.messages,
            WaitTimeSeconds: options?.polling
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
