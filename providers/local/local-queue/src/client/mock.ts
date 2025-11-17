import type { Client, Queue, SendOptions } from '@ez4/queue';

import { Logger } from '@ez4/project/library';

export const createClientMock = <T extends Queue.Service<any>>(serviceName: string): Client<T> => {
  return new (class {
    sendMessage(_message: T['schema'], _options?: SendOptions<T>) {
      Logger.debug(`✉️  Sending message to queue [${serviceName}]`);
      return Promise.resolve();
    }

    receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};
