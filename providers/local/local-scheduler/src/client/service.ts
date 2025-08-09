import type { Client, ScheduleEvent } from '@ez4/scheduler';
import type { EventSchema } from '@ez4/scheduler/utils';

import { getJsonEvent } from '@ez4/scheduler/utils';

import { InMemoryScheduler } from '../service/scheduler.js';

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
    }

    async updateEvent(identifier: string, input: Partial<ScheduleEvent<any>>) {
      const event = await getJsonEvent(input.event, eventSchema);

      InMemoryScheduler.updateEvent(serviceName, identifier, {
        ...input,
        event
      });
    }

    async deleteEvent(identifier: string) {
      InMemoryScheduler.deleteEvent(serviceName, identifier);
    }
  })();
};
