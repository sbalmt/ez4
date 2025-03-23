import type { AnySchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';

export const getRequestJsonBody = async (input: AnyObject, schema: AnySchema): Promise<Http.JsonBody> => {
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

  return body as Http.JsonBody;
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
