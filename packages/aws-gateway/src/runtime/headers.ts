import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { createTransformContext, transform } from '@ez4/transform';
import { validate } from '@ez4/validator';

export const getHeaders = async (input: AnyObject, schema: ObjectSchema): Promise<Http.Headers> => {
  const headers = transform(
    input,
    schema,
    createTransformContext({
      convert: false
    })
  );

  const errors = await validate(
    headers,
    schema,
    createValidatorContext({
      property: '$header'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed headers.', messages);
  }

  return headers as Http.Headers;
};
