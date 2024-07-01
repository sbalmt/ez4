import type { ObjectSchema } from '@ez4/schema';
import type { Queue } from '@ez4/queue';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedMessageError } from './errors.js';

export const getJsonMessage = async <T extends Queue.Message>(
  rawInput: T,
  schema: ObjectSchema
) => {
  const errors = await validate(rawInput, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedMessageError(messages);
  }

  return rawInput;
};
