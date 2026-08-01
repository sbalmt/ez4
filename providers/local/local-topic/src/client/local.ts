import type { Client, Topic } from '@ez4/topic';
import type { EventSchema } from '@ez4/topic/utils';
import type { ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { getJsonEvent } from '@ez4/topic/utils';
import { Logger } from '@ez4/logger';

export type LocalClientOptions = ServeOptions & {
  handler: (event: AnyObject) => Promise<void>;
};

export const createLocalClient = <T extends Topic.Event = any>(
  resourceName: string,
  eventSchema: EventSchema,
  clientOptions: LocalClientOptions
): Client<T> => {
  return new (class {
    async publishEvent(event: T) {
      Logger.log(`✉️  Publishing event to topic [${resourceName}]`);

      const payload = await getJsonEvent(event, eventSchema);

      setImmediate(async () => {
        try {
          await clientOptions.handler(payload);
        } catch (error) {
          Logger.error(`Local topic [${resourceName}] finished with errors.`);
          Logger.error(`    ${error}`);
        }
      });
    }
  })();
};
