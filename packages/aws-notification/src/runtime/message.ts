import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Notification } from '@ez4/notification';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedMessageError } from './errors.js';

export const getJsonMessage = async <T extends Notification.Message>(
  message: T,
  schema: ObjectSchema | UnionSchema
) => {
  const errors = await validate(message, schema);

  if (errors.length) {
    throw new MalformedMessageError(getUniqueErrorMessages(errors));
  }

  return message;
};
