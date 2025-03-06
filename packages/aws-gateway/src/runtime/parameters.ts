import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { HttpBadRequestError } from '@ez4/gateway';
import { getNewContext, getUniqueErrorMessages } from '@ez4/validator';
import { transform } from '@ez4/transform';
import { validate } from '@ez4/validator';

export const getPathParameters = async (
  rawInput: Record<string, unknown>,
  schema: ObjectSchema
): Promise<Http.PathParameters | undefined> => {
  const parameters = transform(rawInput, schema) as Http.PathParameters;
  const errors = await validate(parameters, schema, getNewContext('$path'));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed path parameters.`, messages);
  }

  return parameters;
};
