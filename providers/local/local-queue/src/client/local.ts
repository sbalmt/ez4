import type { Client, Queue, SendOptions } from '@ez4/queue';
import type { ServeOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';
import type { AnyObject } from '@ez4/utils';

import { getJsonMessage } from '@ez4/queue/utils';
import { Logger } from '@ez4/logger';

export type LocalClientOptions = ServeOptions & {
  handler: (message: AnyObject) => Promise<void>;
  delay: number;
};

export const createLocalClient = <T extends Queue.Message = any, U extends Queue.FifoMode<T> | undefined = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: LocalClientOptions
): Client<T, U> => {
  return new (class {
    async sendMessage(message: T, options?: SendOptions<U>) {
      Logger.debug(`✉️  Sending message to queue [${serviceName}]`);

      const payload = await getJsonMessage(message, messageSchema);
      const delay = options?.delay ?? clientOptions.delay;

      setTimeout(() => clientOptions.handler(payload), delay * 1000);
    }

    receiveMessage(): Promise<T[]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};
