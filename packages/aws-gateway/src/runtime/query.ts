import type { ObjectSchema } from '@ez4/schema';

import { HttpBadRequestError } from '@ez4/gateway';
import { getUniqueErrorMessages } from '@ez4/validator';
import { transform } from '@ez4/transform';
import { validate } from '@ez4/validator';

export const getQueryStrings = async (rawInput: Record<string, unknown>, schema: ObjectSchema) => {
  const query = transform(rawInput, schema);
  const errors = await validate(query, schema, '$query');

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed query strings.`, messages);
  }

  return query;
};
