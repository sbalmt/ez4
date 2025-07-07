import type { Cron, ScheduleEvent } from '@ez4/scheduler';

import { deepClone, deepMerge } from '@ez4/utils';

type InMemorySchedulerData<T extends Cron.Event> = InMemoryScheduler.SchedulerParameters & {
  events: Record<string, InMemorySchedulerEvent<T>>;
};

type InMemorySchedulerEvent<T extends Cron.Event> = ScheduleEvent<T> & {
  timerId: NodeJS.Timeout;
};

const ALL_SCHEDULERS: Record<string, InMemorySchedulerData<any>> = {};

export namespace InMemoryScheduler {
  export type SchedulerParameters = {
    handler: (event: Cron.Event) => Promise<void> | void;
  };

  export const createScheduler = (schedulerName: string, parameters: SchedulerParameters) => {
    if (ALL_SCHEDULERS[schedulerName]) {
      throw new Error(`Scheduler ${schedulerName} already exists.`);
    }

    ALL_SCHEDULERS[schedulerName] = {
      ...parameters,
      events: {}
    };
  };

  export const getScheduler = (schedulerName: string) => {
    if (!ALL_SCHEDULERS[schedulerName]) {
      throw new Error(`Scheduler ${schedulerName} not found.`);
    }

    return ALL_SCHEDULERS[schedulerName];
  };

  export const createEvent = <T extends Cron.Event>(schedulerName: string, identifier: string, input: ScheduleEvent<T>) => {
    const instance = getScheduler(schedulerName);
    const interval = input.date.getTime() - Date.now();

    if (interval < 0) {
      throw new Error(`Event for scheduler ${schedulerName} is too old.`);
    }

    const timerId = setTimeout(async () => await instance.handler(input.event), interval);

    instance.events[identifier] = {
      ...input,
      timerId
    };
  };

  export const deleteEvent = (schedulerName: string, identifier: string) => {
    const instance = getScheduler(schedulerName);
    const current = instance.events[identifier];

    if (!current) {
      throw new Error(`Event ${identifier} not found on scheduler ${schedulerName}.`);
    }

    clearTimeout(current.timerId);

    delete instance.events[identifier];

    return current;
  };

  export const updateEvent = <T extends Cron.Event>(schedulerName: string, identifier: string, input: Partial<ScheduleEvent<T>>) => {
    const previous = deleteEvent(schedulerName, identifier);
    const current = deepMerge(previous, input);

    createEvent(schedulerName, identifier, current);
  };

  export const getEvent = (schedulerName: string, identifier: string) => {
    const current = getScheduler(schedulerName).events[identifier];

    if (!current) {
      return undefined;
    }

    return deepClone(current, {
      include: {
        date: true,
        maxRetries: true,
        maxAge: true,
        event: true
      }
    });
  };
}
