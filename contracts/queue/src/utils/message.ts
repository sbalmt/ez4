import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Queue } from '@ez4/queue';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';

import { MalformedMessageError } from './errors';

export type MessageSchema = ObjectSchema | UnionSchema;

export const getJsonMessage = async <T extends Queue.Message>(
  input: T,
  schema: MessageSchema,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const payload = transform(input, schema, createTransformContext({ convert: false }));

  const validationContext = createValidatorContext({
    property: '$message',
    onCustomValidation
  });

  const validationErrors = await validate(payload, schema, validationContext);

  if (validationErrors.length) {
    throw new MalformedMessageError(getUniqueErrorMessages(validationErrors));
  }

  return payload as T;
};

export const getJsonStringMessage = async <T extends Queue.Message>(message: T, schema: MessageSchema) => {
  const safeMessage = await getJsonMessage(message, schema);

  return JSON.stringify(safeMessage);
};
