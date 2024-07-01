import type { ObjectSchema } from '@ez4/schema';

import { HttpBadRequestError } from '@ez4/gateway';
import { getUniqueErrorMessages } from '@ez4/validator';
import { validate } from '@ez4/validator';

export const getJsonBody = async (rawInput: Record<string, unknown>, schema: ObjectSchema) => {
  const errors = await validate(rawInput, schema, '$body');

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed body payload.`, messages);
  }

  return rawInput;
};
