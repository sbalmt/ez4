import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Queue } from '@ez4/queue';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedEventError } from './errors.js';

export const getJsonEvent = async <T extends Queue.Message>(
  message: T,
  schema: ObjectSchema | UnionSchema
) => {
  const errors = await validate(message, schema);

  if (errors.length) {
    throw new MalformedEventError(getUniqueErrorMessages(errors));
  }

  return message;
};
