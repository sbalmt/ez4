import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';

export const getQueryStrings = async <T extends Http.QueryStrings>(input: T, schema: ObjectSchema): Promise<T> => {
  const query = transform(
    input,
    schema,
    createTransformContext({
      convert: true
    })
  );

  const errors = await validate(
    query,
    schema,
    createValidatorContext({
      property: '$query'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed query strings.', messages);
  }

  return query as T;
};
