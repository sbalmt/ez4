import type { Client, ScheduleEvent } from '@ez4/scheduler';
import type { EventSchema } from '@ez4/scheduler/utils';

import { getJsonEvent } from '@ez4/scheduler/utils';
import { Logger } from '@ez4/project/library';

import { InMemoryScheduler } from '../service/scheduler';

export const createServiceClient = (serviceName: string, eventSchema: EventSchema): Client<any> => {
  return new (class {
    async getEvent(identifier: string) {
      return InMemoryScheduler.getEvent(serviceName, identifier);
    }

    async createEvent(identifier: string, input: ScheduleEvent<any>) {
      const event = await getJsonEvent(input.event, eventSchema);

      InMemoryScheduler.createEvent(serviceName, identifier, {
        ...input,
        event
      });

      const isoDate = input.date.toISOString();

      Logger.debug(`⌚ Event ${identifier} created to run at ${isoDate}`);
    }

    async updateEvent(identifier: string, input: Partial<ScheduleEvent<any>>) {
      const event = input.event ? await getJsonEvent(input.event, eventSchema) : undefined;

      InMemoryScheduler.updateEvent(serviceName, identifier, {
        ...input,
        event
      });

      Logger.debug(`⌚ Event ${identifier} updated.`);
    }

    async deleteEvent(identifier: string) {
      InMemoryScheduler.deleteEvent(serviceName, identifier);

      Logger.debug(`ℹ️  Event ${identifier} deleted.`);
    }
  })();
};
