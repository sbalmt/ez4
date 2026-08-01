import type { Client, Topic } from '@ez4/topic';

import { Logger } from '@ez4/logger';

export const createClientMock = <T extends Topic.Event = any>(resourceName: string): Client<T> => {
  return new (class {
    publishEvent(_event: T) {
      Logger.log(`✉️  Publishing event to topic [${resourceName}]`);
      return Promise.resolve();
    }
  })();
};
