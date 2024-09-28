import type { Queue, ReceiveOptions, SendOptions, Client as SqsClient } from '@ez4/queue';
import type { ObjectSchema } from '@ez4/schema';

import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getJsonMessage } from '@ez4/aws-queue/runtime';

const client = new SQSClient({});

export namespace Client {
  export const make = <T extends Queue.Message>(
    queueUrl: string,
    messageSchema: ObjectSchema
  ): SqsClient<T> => {
    return new (class {
      async sendMessage(message: T, options?: SendOptions) {
        const safeMessage = await getJsonMessage(message, messageSchema);
        const rawMessage = JSON.stringify(safeMessage);

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: rawMessage,
            DelaySeconds: options?.delay
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
