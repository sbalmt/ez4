import type { Client, Queue, SendOptions } from '@ez4/queue';

import { Logger } from '@ez4/project/library';

export const createMockedClient = <T extends Queue.Service<any>>(serviceName: string): Client<T> => {
  return new (class {
    async sendMessage(_message: T['schema'], _options?: SendOptions<T>) {
      Logger.debug(`✉️  Sending message to Queue [${serviceName}]`);
    }

    async receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};
