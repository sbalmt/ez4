import type { Client, Queue, SendOptions } from '@ez4/queue';
import type { ProviderContext } from '@ez4/emulator';
import type { MessageSchema } from '@ez4/queue/utils';

import { getJsonMessage } from '@ez4/queue/utils';
import { Logger } from '@ez4/logger';

import { ProviderEvent } from '../types/events';

export type LocalClientOptions = {
  delay: number;
};

export const createLocalClient = <T extends Queue.Message = any, U extends Queue.Mode = any>(
  resourceName: string,
  messageSchema: MessageSchema,
  clientOptions: LocalClientOptions,
  context: Pick<ProviderContext, 'notify'>
): Client<T, U> => {
  return new (class {
    async sendMessage(message: T, options?: SendOptions<U>) {
      Logger.log(`✉️  Sending message to queue [${resourceName}]`);

      const payload = await getJsonMessage(message, messageSchema);
      const delay = options?.delay ?? clientOptions.delay;

      context.notify(ProviderEvent.PutMessage, {
        message: payload,
        delay
      });
    }

    receiveMessage(): Promise<T[]> {
      throw new Error(`Receive message isn't supported yet.`);
    }
  })();
};
