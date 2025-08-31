import type { Client, Topic } from '@ez4/topic';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { Logger } from '@ez4/project/library';

export type ServiceClientOptions = ServeOptions & {
  handler: (message: AnyObject) => Promise<void>;
};

export const createMockedClient = <T extends Topic.Message = any>(serviceName: string): Client<T> => {
  return new (class {
    async sendMessage(_message: T) {
      Logger.debug(`✉️  Sending message to topic [${serviceName}]`);
    }
  })();
};
