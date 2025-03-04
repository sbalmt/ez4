import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, getNewContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { transform } from '@ez4/transform';
import { validate } from '@ez4/validator';

export const getHeaders = async (
  rawInput: Record<string, unknown>,
  schema: ObjectSchema
): Promise<Http.Headers | undefined> => {
  const headers = transform(rawInput, schema) as Http.Headers;
  const errors = await validate(headers, schema, getNewContext('$header'));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed header strings.`, messages);
  }

  return headers;
};
