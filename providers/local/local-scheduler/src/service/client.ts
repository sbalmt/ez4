import type { Client, ScheduleEvent } from '@ez4/scheduler';

import { InMemoryScheduler } from './scheduler.js';

export const createSchedulerClient = (serviceName: string): Client<any> => {
  return new (class {
    async getEvent(identifier: string) {
      return InMemoryScheduler.getEvent(serviceName, identifier);
    }

    async createEvent(identifier: string, input: ScheduleEvent<any>) {
      InMemoryScheduler.createEvent(serviceName, identifier, input);
    }

    async updateEvent(identifier: string, input: Partial<ScheduleEvent<any>>) {
      InMemoryScheduler.updateEvent(serviceName, identifier, input);
    }

    async deleteEvent(identifier: string) {
      InMemoryScheduler.deleteEvent(serviceName, identifier);
    }
  })();
};
