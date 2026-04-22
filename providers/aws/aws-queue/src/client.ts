import type { Queue, ReceiveOptions, SendOptions, Client as SqsClient } from '@ez4/queue';
import type { SendMessageRequest } from '@aws-sdk/client-sqs';
import type { MessageSchema } from '@ez4/queue/utils';
import type { AnyObject } from '@ez4/utils';

import { MissingMessageGroupError, getJsonMessage, getJsonStringMessage } from '@ez4/queue/utils';
import { ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export namespace Client {
  const client = new SQSClient();

  export type Parameters<T extends Queue.Message> = {
    fifoMode?: Queue.FifoMode<T>;
    fairMode?: Queue.FairMode<T>;
  };

  export const make = <T extends Queue.Message, U extends Queue.Mode>(
    queueUrl: string,
    messageSchema: MessageSchema,
    parameters?: Parameters<T>
  ): SqsClient<T, U> => {
    return new (class {
      async sendMessage(message: T, options?: SendOptions<U>) {
        const messageBody = await getJsonStringMessage(message, messageSchema);
        const scope = Runtime.getScope();

        await client.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            DelaySeconds: options?.delay,
            MessageBody: messageBody,
            ...(parameters?.fifoMode && getFifoParameters(message, parameters.fifoMode)),
            ...(parameters?.fairMode && getFairParameters(message, parameters.fairMode)),
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
            MaxNumberOfMessages: options?.messages,
            WaitTimeSeconds: options?.polling,
            QueueUrl: queueUrl
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

const getFairParameters = <T extends Queue.Message>(
  message: AnyObject,
  fairMode: Queue.FairMode<T>
): Pick<SendMessageRequest, 'MessageGroupId'> => {
  const { groupId } = fairMode;

  const groupIdValue = message[groupId];

  if (!groupIdValue) {
    throw new MissingMessageGroupError(groupId.toString());
  }

  return {
    MessageGroupId: `${groupIdValue}`
  };
};

const getFifoParameters = <T extends Queue.Message>(
  message: AnyObject,
  fifoMode: Queue.FifoMode<T>
): Pick<SendMessageRequest, 'MessageGroupId' | 'MessageDeduplicationId'> => {
  const { uniqueId } = fifoMode;

  const uniqueIdValue = uniqueId && message[uniqueId];

  return {
    ...getFairParameters(message, fifoMode),
    ...(uniqueIdValue && {
      MessageDeduplicationId: `${uniqueIdValue}`
    })
  };
};
