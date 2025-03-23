import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { validate } from '@ez4/validator';

export const getIdentity = async (input: AnyObject, schema: ObjectSchema): Promise<Http.Identity> => {
  const errors = await validate(
    input,
    schema,
    createValidatorContext({
      property: '$identity'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed identity.`, messages);
  }

  return input;
};
