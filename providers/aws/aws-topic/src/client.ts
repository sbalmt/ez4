import type { PublishInput, PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type { Topic, Client as SnsClient } from '@ez4/topic';
import type { EventSchema } from '@ez4/topic/utils';
import type { AnyObject } from '@ez4/utils';

import { getJsonStringEvent, MissingEventGroupError } from '@ez4/topic/utils';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

type FifoParameters = Pick<PublishInput, 'MessageGroupId' | 'MessageDeduplicationId'>;

type SnsCache = {
  snsClient: SNSClient;
  PublishCommand: typeof PublishCommand;
};

let SNS_CACHE: Promise<SnsCache> | undefined;

export namespace Client {
  export const make = <T extends Topic.Event>(topicArn: string, eventSchema: EventSchema, fifoMode?: Topic.FifoMode<T>): SnsClient<T> => {
    return new (class {
      async publishEvent(event: T) {
        const [payload, { snsClient, PublishCommand }] = await Promise.all([getJsonStringEvent(event, eventSchema), getSnsClient()]);

        const scope = Runtime.getScope();

        await snsClient.send(
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

const getSnsClient = async () => {
  if (!SNS_CACHE) {
    SNS_CACHE = import('@aws-sdk/client-sns')
      .then(({ SNSClient, PublishCommand }) => {
        return {
          snsClient: new SNSClient(),
          PublishCommand
        };
      })
      .catch((error) => {
        SNS_CACHE = undefined;
        throw error;
      });
  }

  return SNS_CACHE;
};
