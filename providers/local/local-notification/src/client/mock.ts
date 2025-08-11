import type { Client, Notification } from '@ez4/notification';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { Logger } from '@ez4/project/library';

export type ServiceClientOptions = ServeOptions & {
  handler: (message: AnyObject) => Promise<void>;
};

export const createMockedClient = <T extends Notification.Message = any>(serviceName: string): Client<T> => {
  return new (class {
    async sendMessage(_message: T) {
      Logger.debug(`✉️  Sending message to Notification topic [${serviceName}]`);
    }
  })();
};
