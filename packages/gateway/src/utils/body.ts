import type { AnySchema } from '@ez4/schema';
import type { Http } from '../services/contract.js';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';

export const getRequestBody = async <T extends Http.JsonBody | Http.RawBody>(input: T, schema: AnySchema): Promise<T> => {
  const errors = await validate(input, schema, createValidatorContext({ property: '$body' }));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed body payload.', messages);
  }

  const body = transform(input, schema, createTransformContext({ convert: false }));

  return body as T;
};

export const getResponseBody = (body: unknown, schema: AnySchema) => {
  return transform(body, schema, createTransformContext({ convert: false }));
};
