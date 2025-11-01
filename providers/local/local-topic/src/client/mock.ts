import type { Client, Topic } from '@ez4/topic';

import { Logger } from '@ez4/project/library';

export const createMockClient = <T extends Topic.Message = any>(serviceName: string): Client<T> => {
  return new (class {
    sendMessage(_message: T) {
      Logger.debug(`✉️  Sending message to topic [${serviceName}]`);
      return Promise.resolve();
    }
  })();
};
