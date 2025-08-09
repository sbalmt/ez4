import type { Client, Queue, SendOptions } from '@ez4/queue';
import type { ServeOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';
import type { AnyObject } from '@ez4/utils';

import { getJsonMessage } from '@ez4/queue/utils';
import { Logger } from '@ez4/project/library';

export type ClientOptions = ServeOptions & {
  delay?: number;
  handler: (message: AnyObject) => void;
};

export const createServiceClient = <T extends Queue.Service<any>>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: ClientOptions
): Client<T> => {
  return new (class {
    async sendMessage(message: T['schema'], options?: SendOptions<T>) {
      Logger.log(`✉️  Sending message to Queue [${serviceName}]`);

      const payload = await getJsonMessage(message, messageSchema);
      const delay = clientOptions.delay ?? options?.delay ?? 0;

      setTimeout(() => clientOptions.handler(payload), delay * 1000);
    }

    async receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn\'t supported yet.`);
    }
  })();
};
