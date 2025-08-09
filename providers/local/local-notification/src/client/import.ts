import type { Client, Notification } from '@ez4/notification';
import type { MessageSchema } from '@ez4/notification/utils';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonStringMessage } from '@ez4/notification/utils';
import { getServiceName, Logger } from '@ez4/project/library';

export type ImportedClientOptions = ServeOptions & {
  handler: (message: AnyObject) => void;
};

export const createImportedClient = <T extends Notification.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: ImportedClientOptions
): Client<T> => {
  const notificationIdentifier = getServiceName(serviceName, clientOptions);
  const notificationTopicHost = `http://${clientOptions.serviceHost}/${notificationIdentifier}`;

  return new (class {
    async sendMessage(message: T) {
      Logger.debug(`✉️  Sending message to Notification topic [${serviceName}] at ${notificationTopicHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      try {
        const response = await fetch(notificationTopicHost, {
          method: 'POST',
          body: payload,
          headers: {
            ['content-type']: 'application/json'
          }
        });

        if (!response.ok) {
          Logger.error(`Notification topic [${serviceName}] isn't available.`);
        }
      } catch (error) {
        Logger.error(`${error}`);
      }
    }
  })();
};
