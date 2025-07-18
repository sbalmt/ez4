import type { Client, Queue } from '@ez4/queue';
import type { ServeOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';

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
      const safeMessage = await getJsonStringMessage(message, messageSchema);

      Logger.log(`➡️  Sending message to Queue [${serviceName}] at ${queueHost}`);

      const response = await fetch(queueHost, {
        method: 'POST',
        body: safeMessage,
        headers: {
          ['content-type']: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Queue ${serviceName} isn't available.`);
      }
    }

    async receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn\'t supported yet.`);
    }
  })();
};
