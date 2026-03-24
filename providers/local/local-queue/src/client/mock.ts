import type { Client, Queue, SendOptions } from '@ez4/queue';

import { Logger } from '@ez4/logger';

export const createClientMock = <T extends Queue.Message = any, U extends Queue.FifoMode<T> | undefined = any>(
  resourceName: string
): Client<T, U> => {
  return new (class {
    sendMessage(_message: T, _options?: SendOptions<U>) {
      Logger.log(`✉️  Sending message to queue [${resourceName}]`);
      return Promise.resolve();
    }

    receiveMessage(): Promise<T[]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};
