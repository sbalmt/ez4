import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const getHeaders = async <T extends Http.Headers>(input: T, schema: ObjectSchema): Promise<T> => {
  const headers = transform(input, schema, createTransformContext({ convert: false }));

  const errors = await validate(headers, schema, createValidatorContext({ property: '$header' }));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed request headers.', messages);
  }

  return headers as T;
};
