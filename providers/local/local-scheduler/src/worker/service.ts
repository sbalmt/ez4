import type { Client, Cron, ScheduleEvent } from '@ez4/scheduler';
import type { EventSchema } from '@ez4/scheduler/utils';
import type { ProviderContext } from '@ez4/emulator';

import { getJsonEvent } from '@ez4/scheduler/utils';

import { getClientError, getScheduleEvent } from '../utils/event';
import { ProviderEvent } from '../types/events';

export type ServiceOptions = {
  schema?: EventSchema;
  name: string;
};

export const makeService = <T extends Cron.Event = any>(options: ServiceOptions, context: ProviderContext) => {
  const { name, schema } = options;

  if (!schema) {
    return undefined;
  }

  const request = async (event: ProviderEvent, identifier: string, input?: Partial<ScheduleEvent<T>>) => {
    try {
      return await context.request(event, {
        identifier,
        input
      });
    } catch (error) {
      throw getClientError(error, name, identifier);
    }
  };

  return (): Client<T> => {
    return {
      getEvent: async (identifier: string) => {
        const event = await request(ProviderEvent.GetEvent, identifier);

        return event ? getScheduleEvent<ScheduleEvent<T>>(event) : undefined;
      },

      setEvent: async (identifier: string, input: ScheduleEvent<T>) => {
        const event = await getJsonEvent(input.event, schema);

        await request(ProviderEvent.SetEvent, identifier, {
          ...input,
          event
        });
      },

      createEvent: async (identifier: string, input: ScheduleEvent<T>) => {
        const event = await getJsonEvent(input.event, schema);

        await request(ProviderEvent.CreateEvent, identifier, {
          ...input,
          event
        });
      },

      updateEvent: async (identifier: string, input: Partial<ScheduleEvent<T>>) => {
        const event = input.event ? await getJsonEvent(input.event, schema) : undefined;

        await request(ProviderEvent.UpdateEvent, identifier, {
          ...input,
          event
        });
      },

      deleteEvent: async (identifier: string) => {
        const deleted = await request(ProviderEvent.DeleteEvent, identifier);

        return !!deleted;
      }
    };
  };
};
