import type { ScheduleEvent } from '@ez4/scheduler';
import type { AnyObject } from '@ez4/utils';

import { EventNotFoundError, EventTooOldError } from '../errors/scheduler';

/**
 * Restore the schedule event date after its serialization between host and worker.
 */
export const getScheduleEvent = <T extends Partial<ScheduleEvent<any>>>(input: AnyObject): T => {
  if (input.date) {
    return {
      ...input,
      date: new Date(input.date)
    } as T;
  }

  return input as T;
};

/**
 * Re-map client errors thrown in the host into their original types.
 */
export const getClientError = (error: unknown, schedulerName: string, identifier: string) => {
  if (error instanceof Error) {
    switch (error.name) {
      case EventTooOldError.name:
        return new EventTooOldError(schedulerName);

      case EventNotFoundError.name:
        return new EventNotFoundError(schedulerName, identifier);
    }
  }

  return error;
};
