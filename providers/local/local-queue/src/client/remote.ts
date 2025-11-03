import type { Client, Queue, SendOptions } from '@ez4/queue';
import type { CommonOptions } from '@ez4/project/library';
import type { MessageSchema } from '@ez4/queue/utils';

import { getServiceName, Logger } from '@ez4/project/library';
import { getJsonStringMessage } from '@ez4/queue/utils';

export type RemoteClientOptions = CommonOptions & {
  serviceHost: string;
};

export const createRemoteClient = <T extends Queue.Service<any>>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: RemoteClientOptions
): Client<T> => {
  const queueIdentifier = getServiceName(serviceName, clientOptions);
  const queueHost = `http://${clientOptions.serviceHost}/${queueIdentifier}`;

  return new (class {
    async sendMessage(message: T['schema'], _options?: SendOptions<T>) {
      Logger.debug(`✉️  Sending message to queue [${serviceName}] at ${queueHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      setImmediate(() => forwardQueueMessage(serviceName, queueHost, payload));
    }

    receiveMessage(): Promise<T['schema'][]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};

const forwardQueueMessage = async (serviceName: string, serviceHost: string, payload: string) => {
  try {
    const response = await fetch(serviceHost, {
      method: 'POST',
      body: payload,
      headers: {
        ['content-type']: 'application/json'
      }
    });

    if (!response.ok) {
      const { message } = await response.json();

      throw new Error(message);
    }
  } catch {
    Logger.warn(`Remote queue [${serviceName}] at ${serviceHost} isn't available.`);
  }
};
