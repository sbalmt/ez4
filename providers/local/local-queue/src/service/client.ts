import type { ServeOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';
import type { Client, Queue } from '@ez4/queue';

import { getServiceName, Logger } from '@ez4/project/library';
import { getJsonStringMessage } from '@ez4/queue/utils';

export const createQueueClient = <T extends Queue.Service<any>>(
  serviceName: string,
  messageSchema: MessageSchema,
  serveOptions: ServeOptions
): Client<T> => {
  const queueIdentifier = getServiceName(serviceName, serveOptions);
  const queueHost = `http://${serveOptions.serviceHost}/${queueIdentifier}`;

  return new (class {
    async sendMessage(message: T['schema']) {
      Logger.log(`✉️  Sending message to Queue [${serviceName}] at ${queueHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      try {
        const response = await fetch(queueHost, {
          method: 'POST',
          body: payload,
          headers: {
            ['content-type']: 'application/json'
          }
        });

        if (!response.ok) {
          Logger.error(`Queue [${serviceName}] isn't available.`);
        }
      } catch (error) {
        Logger.error(`${error}`);
      }
    }

    async receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn\'t supported yet.`);
    }
  })();
};
