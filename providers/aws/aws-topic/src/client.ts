import type { Topic, Client as SnsClient } from '@ez4/topic';
import type { MessageSchema } from '@ez4/topic/utils';
import type { PublishInput } from '@aws-sdk/client-sns';
import type { AnyObject } from '@ez4/utils';

import { getJsonStringMessage, MissingMessageGroupError } from '@ez4/topic/utils';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

const client = new SNSClient({});

type FifoParameters = Pick<PublishInput, 'MessageGroupId' | 'MessageDeduplicationId'>;

export namespace Client {
  export const make = <T extends Topic.Message>(
    topicArn: string,
    messageSchema: MessageSchema,
    fifoMode?: Topic.FifoMode<T>
  ): SnsClient<T> => {
    return new (class {
      async sendMessage(message: T) {
        const messageBody = await getJsonStringMessage(message, messageSchema);

        await client.send(
          new PublishCommand({
            TargetArn: topicArn,
            Message: messageBody,
            ...(fifoMode && {
              ...getFifoParameters(message, fifoMode)
            })
          })
        );
      }
    })();
  };
}

const getFifoParameters = <T extends Topic.Message>(message: AnyObject, fifoMode: Topic.FifoMode<T>) => {
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
