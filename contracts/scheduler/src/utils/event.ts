import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Cron } from '@ez4/scheduler';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { transform, createTransformContext } from '@ez4/transform';

import { MalformedEventError } from './errors.js';

export type EventSchema = ObjectSchema | UnionSchema;

export const getJsonEvent = async <T extends Cron.Event>(input: T, schema: EventSchema) => {
  const event = transform(input, schema, createTransformContext({ convert: false }));

  const errors = await validate(event, schema, createValidatorContext({ property: '$event' }));

  if (errors.length) {
    throw new MalformedEventError(getUniqueErrorMessages(errors));
  }

  return event as T;
};

export const getJsonStringEvent = async <T extends Cron.Event>(event: T, schema: EventSchema) => {
  const safeEvent = await getJsonEvent(event, schema);

  return JSON.stringify(safeEvent);
};
