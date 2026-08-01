import type { Topic, Client as SnsClient } from '@ez4/topic';
import type { EventSchema } from '@ez4/topic/utils';
import type { PublishInput } from '@aws-sdk/client-sns';
import type { AnyObject } from '@ez4/utils';

import { getJsonStringEvent, MissingEventGroupError } from '@ez4/topic/utils';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

type FifoParameters = Pick<PublishInput, 'MessageGroupId' | 'MessageDeduplicationId'>;

export namespace Client {
  const client = new SNSClient();

  export const make = <T extends Topic.Event>(topicArn: string, eventSchema: EventSchema, fifoMode?: Topic.FifoMode<T>): SnsClient<T> => {
    return new (class {
      async publishEvent(event: T) {
        const payload = await getJsonStringEvent(event, eventSchema);
        const scope = Runtime.getScope();

        await client.send(
          new PublishCommand({
            TargetArn: topicArn,
            Message: payload,
            ...(fifoMode && {
              ...getFifoParameters(event, fifoMode)
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
    })();
  };
}

const getFifoParameters = <T extends Topic.Event>(event: AnyObject, fifoMode: Topic.FifoMode<T>) => {
  const parameters: FifoParameters = {};

  if (fifoMode) {
    const { groupId, uniqueId } = fifoMode;

    parameters.MessageGroupId = `${event[groupId]}`;

    if (!parameters.MessageGroupId) {
      throw new MissingEventGroupError(groupId.toString());
    }

    if (uniqueId && event[uniqueId]) {
      parameters.MessageDeduplicationId = `${event[uniqueId]}`;
    }
  }

  return parameters;
};
