import { Logger } from '@ez4/project/library';
import type { Client, ScheduleEvent } from '@ez4/scheduler';

export const createMockedClient = (_serviceName: string): Client<any> => {
  const schedulerMemory: Record<string, ScheduleEvent<any>> = {};

  return new (class {
    async getEvent(identifier: string) {
      const event = schedulerMemory[identifier];

      return Promise.resolve(event);
    }

    async createEvent(identifier: string, input: ScheduleEvent<any>) {
      schedulerMemory[identifier] = input;

      const isoDate = input.date.toISOString();

      Logger.debug(`⌚ Event ${identifier} created to run at ${isoDate}`);

      return Promise.resolve();
    }

    async updateEvent(identifier: string, input: Partial<ScheduleEvent<any>>) {
      if (!schedulerMemory[identifier]) {
        throw new Error(`Event ${identifier} not found.`);
      }

      schedulerMemory[identifier] = {
        ...schedulerMemory[identifier],
        ...input
      };

      Logger.debug(`⌚ Event ${identifier} updated.`);
      return Promise.resolve();
    }

    async deleteEvent(identifier: string) {
      if (!schedulerMemory[identifier]) {
        Logger.warn(`Event ${identifier} not found.`);
        return Promise.resolve(false);
      }

      delete schedulerMemory[identifier];

      Logger.debug(`ℹ️  Event ${identifier} deleted.`);
      return Promise.resolve(true);
    }
  })();
};
