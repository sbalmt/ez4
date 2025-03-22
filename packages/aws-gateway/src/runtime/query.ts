import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { HttpBadRequestError } from '@ez4/gateway';
import { getNewContext, getUniqueErrorMessages } from '@ez4/validator';
import { transform } from '@ez4/transform';
import { validate } from '@ez4/validator';

export const getQueryStrings = async (rawInput: Record<string, unknown>, schema: ObjectSchema): Promise<Http.QueryStrings | undefined> => {
  const query = transform(rawInput, schema) as Http.QueryStrings;
  const errors = await validate(query, schema, getNewContext('$query'));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed query strings.`, messages);
  }

  return query;
};
