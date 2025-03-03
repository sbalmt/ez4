import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Notification } from '@ez4/notification';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedMessageError } from './errors.js';

export type MessageSchema = ObjectSchema | UnionSchema;

export const getJsonMessage = async <T extends Notification.Message>(
  message: T,
  schema: MessageSchema
) => {
  const errors = await validate(message, schema);

  if (errors.length) {
    throw new MalformedMessageError(getUniqueErrorMessages(errors));
  }

  return message;
};

export const getJsonStringMessage = async <T extends Notification.Message>(
  message: T,
  schema: MessageSchema
) => {
  const safeMessage = await getJsonMessage(message, schema);

  return JSON.stringify(safeMessage);
};
