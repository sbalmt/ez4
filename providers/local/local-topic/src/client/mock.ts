import type { Client, Topic } from '@ez4/topic';

import { Logger } from '@ez4/logger';

export const createClientMock = <T extends Topic.Message = any>(resourceName: string): Client<T> => {
  return new (class {
    sendMessage(_message: T) {
      Logger.log(`✉️  Sending message to topic [${resourceName}]`);
      return Promise.resolve();
    }
  })();
};
