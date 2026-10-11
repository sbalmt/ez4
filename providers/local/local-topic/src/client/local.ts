import type { Client, Topic } from '@ez4/topic';
import type { EventSchema } from '@ez4/topic/utils';
import type { ProviderContext } from '@ez4/emulator';

import { getJsonEvent } from '@ez4/topic/utils';
import { Logger } from '@ez4/logger';

import { ProviderEvent } from '../types/events';

export const createLocalClient = <T extends Topic.Event = any>(
  resourceName: string,
  eventSchema: EventSchema,
  context: Pick<ProviderContext, 'notify'>
): Client<T> => {
  return new (class {
    async publishEvent(event: T) {
      Logger.log(`✉️  Publishing event to topic [${resourceName}]`);

      const payload = await getJsonEvent(event, eventSchema);

      context.notify(ProviderEvent.PublishEvent, {
        event: payload
      });
    }
  })();
};
