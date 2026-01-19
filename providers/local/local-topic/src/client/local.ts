import type { Client, Topic } from '@ez4/topic';
import type { MessageSchema } from '@ez4/topic/utils';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonMessage } from '@ez4/topic/utils';
import { Logger } from '@ez4/logger';

export type LocalClientOptions = ServeOptions & {
  handler: (message: AnyObject) => Promise<void>;
};

export const createLocalClient = <T extends Topic.Message = any>(
  serviceName: string,
  messageSchema: MessageSchema,
  clientOptions: LocalClientOptions
): Client<T> => {
  return new (class {
    async sendMessage(message: T) {
      Logger.debug(`✉️  Sending message to topic [${serviceName}]`);

      const payload = await getJsonMessage(message, messageSchema);

      setImmediate(() => clientOptions.handler(payload));
    }
  })();
};
