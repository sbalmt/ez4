import type { ObjectSchema } from '@ez4/schema';
import type { Database } from '@ez4/database';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedRequestError } from './errors.js';

export const getJsonChanges = async <T extends Database.Schema>(
  rawInput: T,
  schema: ObjectSchema
) => {
  const errors = await validate(rawInput, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(messages);
  }

  return rawInput;
};
