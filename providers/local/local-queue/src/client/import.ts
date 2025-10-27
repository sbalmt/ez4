import type { Client, Queue, SendOptions } from '@ez4/queue';
import type { ServeOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';

import { getServiceName, Logger } from '@ez4/project/library';
import { getJsonStringMessage } from '@ez4/queue/utils';

export type ImportedClientOptions = ServeOptions & {
  delay: number;
};

export const createImportedClient = <T extends Queue.Service<any>>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: ImportedClientOptions
): Client<T> => {
  const queueIdentifier = getServiceName(serviceName, clientOptions);
  const queueHost = `http://${clientOptions.serviceHost}/${queueIdentifier}`;

  return new (class {
    async sendMessage(message: T['schema'], options?: SendOptions<T>) {
      Logger.debug(`✉️  Sending message to queue [${serviceName}] at ${queueHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);
      const delay = options?.delay ?? clientOptions.delay;

      setTimeout(() => postMessage(serviceName, queueHost, payload), delay * 1000);
    }

    receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};

const postMessage = async (serviceName: string, queueHost: string, payload: string) => {
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
};
