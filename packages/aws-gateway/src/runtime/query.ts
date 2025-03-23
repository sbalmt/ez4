import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';
import { validate } from '@ez4/validator';

export const getQueryStrings = async (input: Record<string, unknown>, schema: ObjectSchema): Promise<Http.QueryStrings> => {
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

    throw new HttpBadRequestError(`Malformed query strings.`, messages);
  }

  return query as Http.QueryStrings;
};
