import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, getNewContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { validate } from '@ez4/validator';

export const getIdentity = async (
  rawInput: Record<string, unknown>,
  schema: ObjectSchema
): Promise<Http.Identity> => {
  const errors = await validate(rawInput, schema, getNewContext('$identity'));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed identity payload.`, messages);
  }

  return rawInput;
};
