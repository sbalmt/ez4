import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Topic } from '@ez4/topic';

import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { transform, createTransformContext } from '@ez4/transform';

import { MalformedEventError } from './errors';

export type EventSchema = ObjectSchema | UnionSchema;

export const getJsonEvent = async <T extends Topic.Event>(input: T, schema: EventSchema): Promise<T> => {
  const event = transform(input, schema, createTransformContext({ convert: false }));

  const errors = await validate(event, schema, createValidatorContext({ property: '$event' }));

  if (errors.length) {
    throw new MalformedEventError(getErrorDetails(errors));
  }

  return event as T;
};

export const getJsonStringEvent = async <T extends Topic.Event>(event: T, schema: EventSchema) => {
  const safeEvent = await getJsonEvent(event, schema);

  return JSON.stringify(safeEvent);
};
