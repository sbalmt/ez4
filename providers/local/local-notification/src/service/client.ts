import type { Client, Notification } from '@ez4/notification';
import type { MessageSchema } from '@ez4/notification/utils';
import type { ServeOptions } from '@ez4/project/library';

import { getJsonStringMessage } from '@ez4/notification/utils';
import { getServiceName } from '@ez4/project/library';

export const createNotificationClient = <T extends Notification.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  serveOptions: ServeOptions
): Client<T> => {
  const notificationIdentifier = getServiceName(serviceName, serveOptions);
  const notificationHost = `http://${serveOptions.host}/${notificationIdentifier}`;

  return new (class {
    async sendMessage(message: T) {
      const safeMessage = await getJsonStringMessage(message, messageSchema);

      const response = await fetch(notificationHost, {
        method: 'POST',
        body: safeMessage,
        headers: {
          ['content-type']: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Notification ${serviceName} isn't available.`);
      }
    }
  })();
};
