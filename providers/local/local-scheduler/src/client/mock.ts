import type { Client, Cron, ScheduleEvent } from '@ez4/scheduler';

import { Logger } from '@ez4/project/library';

export type ClientMockSchedules<T extends Cron.Event> = {
  events?: Record<string, ScheduleEvent<T>>;
  default?: ScheduleEvent<T>;
};

export const createClientMock = (_serviceName: string, schedules?: ClientMockSchedules<Cron.Event>): Client<any> => {
  const schedulerMemory = schedules?.events ?? {};

  return new (class {
    async getEvent(identifier: string) {
      const event = schedulerMemory[identifier] ?? schedules?.default;

      return Promise.resolve(event);
    }

    async createEvent(identifier: string, input: ScheduleEvent<any>) {
      schedulerMemory[identifier] = input;

      const isoDate = input.date.toISOString();

      Logger.debug(`⌚ Event ${identifier} created to run at ${isoDate}`);

      return Promise.resolve();
    }

    async updateEvent(identifier: string, input: Partial<ScheduleEvent<any>>) {
      const event = schedulerMemory[identifier] ?? schedules?.default;

      if (!event) {
        throw new Error(`Event ${identifier} not found.`);
      }

      schedulerMemory[identifier] = {
        ...event,
        ...input
      };

      Logger.debug(`⌚ Event ${identifier} updated.`);

      return Promise.resolve();
    }

    async deleteEvent(identifier: string) {
      if (!schedulerMemory[identifier]) {
        if (!schedules?.default) {
          Logger.warn(`Event ${identifier} not found.`);

          return Promise.resolve(false);
        }

        return Promise.resolve(true);
      }

      delete schedulerMemory[identifier];

      Logger.debug(`ℹ️  Event ${identifier} deleted.`);

      return Promise.resolve(true);
    }
  })();
};
