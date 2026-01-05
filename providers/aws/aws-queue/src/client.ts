import type { Queue, ReceiveOptions, SendOptions, Client as SqsClient } from '@ez4/queue';
import type { SendMessageRequest } from '@aws-sdk/client-sqs';
import type { MessageSchema } from '@ez4/queue/utils';
import type { AnyObject } from '@ez4/utils';

import { MissingMessageGroupError, getJsonMessage, getJsonStringMessage } from '@ez4/queue/utils';
import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

type FifoParameters = Pick<SendMessageRequest, 'MessageGroupId' | 'MessageDeduplicationId'>;

export namespace Client {
  const client = new SQSClient();

  export const make = <T extends Queue.Service<any>>(
    queueUrl: string,
    messageSchema: MessageSchema,
    fifoMode?: Queue.FifoMode<T>
  ): SqsClient<T> => {
    return new (class {
      async sendMessage(message: T['schema'], options?: SendOptions<T>) {
        const messageBody = await getJsonStringMessage(message, messageSchema);
        const scope = Runtime.getScope();

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            DelaySeconds: options?.delay,
            MessageBody: messageBody,
            ...(fifoMode && {
              ...getFifoParameters(message, fifoMode)
            }),
            MessageAttributes: {
              ['EZ4.TRACE_ID']: {
                StringValue: scope?.traceId ?? getRandomUUID(),
                DataType: 'String'
              }
            }
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

        return Promise.all(safeMessages);
      }
    })();
  };
}

const getFifoParameters = <T extends Queue.Message>(message: AnyObject, fifoMode: Queue.FifoMode<T>) => {
  const parameters: FifoParameters = {};

  if (fifoMode) {
    const { groupId, uniqueId } = fifoMode;

    parameters.MessageGroupId = `${message[groupId]}`;

    if (!parameters.MessageGroupId) {
      throw new MissingMessageGroupError(groupId.toString());
    }

    if (uniqueId && message[uniqueId]) {
      parameters.MessageDeduplicationId = `${message[uniqueId]}`;
    }
  }

  return parameters;
};
