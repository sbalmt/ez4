import type { ObjectSchema } from '@ez4/schema';
import type { Database } from '@ez4/database';

import { getErrorDetails } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { MalformedRequestError } from './errors';

export const validateSchema = async <T extends Database.Schema>(data: T, schema: ObjectSchema) => {
  const errors = await validate(data, schema);

  if (errors.length) {
    throw new MalformedRequestError(getErrorDetails(errors));
  }
};
