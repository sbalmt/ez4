import type { Notification, Client as SnsClient } from '@ez4/notification';
import type { ObjectSchema } from '@ez4/schema';

import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { getJsonMessage } from '@ez4/aws-queue/runtime';

const client = new SNSClient({});

export namespace Client {
  export const make = <T extends Notification.Message>(
    topicArn: string,
    messageSchema: ObjectSchema
  ): SnsClient<T> => {
    return new (class {
      async sendMessage(message: T) {
        const safeMessage = await getJsonMessage(message, messageSchema);
        const rawMessage = JSON.stringify(safeMessage);

        await client.send(
          new PublishCommand({
            TargetArn: topicArn,
            Message: rawMessage
          })
        );
      }
    })();
  };
}
