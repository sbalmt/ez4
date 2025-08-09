import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Notification } from '@ez4/notification';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { transform, createTransformContext } from '@ez4/transform';

import { MalformedMessageError } from './errors.js';

export type MessageSchema = ObjectSchema | UnionSchema;

export const getJsonMessage = async <T extends Notification.Message>(input: T, schema: MessageSchema): Promise<T> => {
  const message = transform(input, schema, createTransformContext({ convert: false }));

  const errors = await validate(message, schema, createValidatorContext({ property: '$message' }));

  if (errors.length) {
    throw new MalformedMessageError(getUniqueErrorMessages(errors));
  }

  return message as T;
};

export const getJsonStringMessage = async <T extends Notification.Message>(message: T, schema: MessageSchema) => {
  const safeMessage = await getJsonMessage(message, schema);

  return JSON.stringify(safeMessage);
};
