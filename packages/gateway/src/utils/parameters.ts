import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';

export const getPathParameters = async <T extends Http.PathParameters>(input: T, schema: ObjectSchema): Promise<T> => {
  const parameters = transform(input, schema, createTransformContext({ convert: false }));

  const errors = await validate(parameters, schema, createValidatorContext({ property: '$path' }));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed path parameters.', messages);
  }

  return parameters as T;
};
