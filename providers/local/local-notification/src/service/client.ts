import type { Client, Notification } from '@ez4/notification';
import type { MessageSchema } from '@ez4/notification/utils';
import type { ServeOptions } from '@ez4/project/library';

import { getJsonStringMessage } from '@ez4/notification/utils';
import { getServiceName, Logger } from '@ez4/project/library';

export const createNotificationClient = <T extends Notification.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  serveOptions: ServeOptions
): Client<T> => {
  const notificationIdentifier = getServiceName(serviceName, serveOptions);
  const notificationHost = `http://${serveOptions.serviceHost}/${notificationIdentifier}`;

  return new (class {
    async sendMessage(message: T) {
      Logger.log(`✉️  Sending message to Topic [${serviceName}] at ${notificationHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      try {
        const response = await fetch(notificationHost, {
          method: 'POST',
          body: payload,
          headers: {
            ['content-type']: 'application/json'
          }
        });

        if (!response.ok) {
          Logger.error(`Topic [${serviceName}] isn't available.`);
        }
      } catch (error) {
        Logger.error(`${error}`);
      }
    }
  })();
};
