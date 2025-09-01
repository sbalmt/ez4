import type { ObjectSchema } from '@ez4/schema';
import type { Database } from '@ez4/database';

import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedRequestError } from './errors';

export const validateSchema = async <T extends Database.Schema>(data: T, schema: ObjectSchema) => {
  const errors = await validate(data, schema);

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(messages);
  }
};
