import type { Client, Notification } from '@ez4/notification';
import type { MessageSchema } from '@ez4/notification/utils';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonMessage } from '@ez4/notification/utils';
import { Logger } from '@ez4/project/library';

export type ServiceClientOptions = ServeOptions & {
  handler: (message: AnyObject) => Promise<void>;
};

export const createServiceClient = <T extends Notification.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: ServiceClientOptions
): Client<T> => {
  return new (class {
    async sendMessage(message: T) {
      Logger.debug(`✉️  Sending message to Notification topic [${serviceName}]`);

      const payload = await getJsonMessage(message, messageSchema);

      setImmediate(() => clientOptions.handler(payload));
    }
  })();
};
