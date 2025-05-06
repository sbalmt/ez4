import type { AnySchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';

export const getRequestJsonBody = async <T extends Http.JsonBody>(input: T, schema: AnySchema): Promise<T> => {
  const errors = await validate(
    input,
    schema,
    createValidatorContext({
      property: '$body'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed body payload.', messages);
  }

  const body = transform(
    input,
    schema,
    createTransformContext({
      convert: false
    })
  );

  return body as T;
};

export const getResponseJsonBody = (body: unknown, schema: AnySchema) => {
  return transform(
    body,
    schema,
    createTransformContext({
      convert: false
    })
  );
};
