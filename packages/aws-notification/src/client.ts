import type { Notification, Client as SnsClient } from '@ez4/notification';
import type { MessageSchema } from '@ez4/aws-notification/runtime';

import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { getJsonStringMessage } from '@ez4/aws-notification/runtime';

const client = new SNSClient({});

export namespace Client {
  export const make = <T extends Notification.Message>(
    topicArn: string,
    messageSchema: MessageSchema
  ): SnsClient<T> => {
    return new (class {
      async sendMessage(message: T) {
        const messageBody = await getJsonStringMessage(message, messageSchema);

        await client.send(
          new PublishCommand({
            TargetArn: topicArn,
            Message: messageBody
          })
        );
      }
    })();
  };
}
