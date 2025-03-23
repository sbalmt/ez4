import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { Http } from '@ez4/gateway';

import { getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { HttpBadRequestError } from '@ez4/gateway';
import { validate } from '@ez4/validator';

export const getPathParameters = async (input: AnyObject, schema: ObjectSchema): Promise<Http.PathParameters> => {
  const parameters = transform(
    input,
    schema,
    createTransformContext({
      convert: false
    })
  );

  const errors = await validate(
    parameters,
    schema,
    createValidatorContext({
      property: '$path'
    })
  );

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError('Malformed path parameters.', messages);
  }

  return parameters as Http.PathParameters;
};
