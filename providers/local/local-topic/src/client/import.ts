import type { Client, Topic } from '@ez4/topic';
import type { MessageSchema } from '@ez4/topic/utils';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonStringMessage } from '@ez4/topic/utils';
import { getServiceName, Logger } from '@ez4/project/library';

export type ImportedClientOptions = ServeOptions & {
  handler: (message: AnyObject) => void;
};

export const createImportedClient = <T extends Topic.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: ImportedClientOptions
): Client<T> => {
  const topicIdentifier = getServiceName(serviceName, clientOptions);
  const topicTopicHost = `http://${clientOptions.serviceHost}/${topicIdentifier}`;

  return new (class {
    async sendMessage(message: T) {
      Logger.debug(`✉️  Sending message to topic [${serviceName}] at ${topicTopicHost}`);

      const payload = await getJsonStringMessage(message, messageSchema);

      try {
        const response = await fetch(topicTopicHost, {
          method: 'POST',
          body: payload,
          headers: {
            ['content-type']: 'application/json'
          }
        });

        if (!response.ok) {
          Logger.error(`Topic [${serviceName}] isn't available.`);
        }
      } catch (error) {
        Logger.error(`${error}`);
      }
    }
  })();
};
