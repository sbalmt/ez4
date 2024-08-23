import type { ObjectSchema } from '@ez4/schema';

import { HttpBadRequestError } from '@ez4/gateway';
import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

export const getIdentity = async (rawInput: Record<string, unknown>, schema: ObjectSchema) => {
  const errors = await validate(rawInput, schema, '$identity');

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed identity payload.`, messages);
  }

  return rawInput;
};
