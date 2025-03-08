import type { Queue, ReceiveOptions, SendOptions, Client as SqsClient } from '@ez4/queue';
import type { SendMessageRequest } from '@aws-sdk/client-sqs';
import type { MessageSchema } from '@ez4/aws-queue/runtime';
import type { QueueFifoMode } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';

import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

import {
  MissingMessageGroupError,
  getJsonMessage,
  getJsonStringMessage
} from '@ez4/aws-queue/runtime';

const client = new SQSClient({});

type FifoParameters = Pick<SendMessageRequest, 'MessageGroupId' | 'MessageDeduplicationId'>;

export namespace Client {
  export const make = <T extends Queue.Message>(
    queueUrl: string,
    messageSchema: MessageSchema,
    fifoMode?: QueueFifoMode
  ): SqsClient<T> => {
    return new (class {
      async sendMessage(message: T, options?: SendOptions) {
        const messageBody = await getJsonStringMessage(message, messageSchema);

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            DelaySeconds: options?.delay,
            MessageBody: messageBody,
            ...(fifoMode && {
              ...getFifoParameters(message, fifoMode)
            })
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

const getFifoParameters = (message: AnyObject, fifoMode: QueueFifoMode) => {
  const parameters: FifoParameters = {};

  if (fifoMode) {
    const { groupId, uniqueId } = fifoMode;

    parameters.MessageGroupId = `${message[groupId]}`;

    if (!parameters.MessageGroupId) {
      throw new MissingMessageGroupError(groupId);
    }

    if (uniqueId && message[uniqueId]) {
      parameters.MessageDeduplicationId = `${message[uniqueId]}`;
    }
  }

  return parameters;
};
