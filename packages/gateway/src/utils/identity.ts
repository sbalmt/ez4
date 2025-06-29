import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const getIdentity = async <T extends Http.Identity>(input: T, schema: ObjectSchema): Promise<T> => {
  const errors = await validate(
    input,
    schema,
    createValidatorContext({
      property: '$identity'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed authorizer identity.', messages);
  }

  return input;
};
