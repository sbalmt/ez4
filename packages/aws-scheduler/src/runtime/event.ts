import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Cron } from '@ez4/scheduler';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedEventError } from './errors.js';

export type EventSchema = ObjectSchema | UnionSchema;

export const getJsonEvent = async <T extends Cron.Event>(event: T, schema: EventSchema) => {
  const errors = await validate(event, schema);

  if (errors.length) {
    throw new MalformedEventError(getUniqueErrorMessages(errors));
  }

  return event;
};

export const getJsonStringEvent = async <T extends Cron.Event>(event: T, schema: EventSchema) => {
  const safeEvent = await getJsonEvent(event, schema);

  return JSON.stringify(safeEvent);
};
