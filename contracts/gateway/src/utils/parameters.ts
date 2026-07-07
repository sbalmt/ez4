import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const resolvePathParameters = async <T extends Http.PathParameters>(
  input: T,
  schema: ObjectSchema,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const parameters = transform(input, schema, createTransformContext({ convert: false }));

  const validationContext = createValidatorContext({
    property: '$path',
    onCustomValidation
  });

  const validationErrors = await validate(parameters, schema, validationContext);

  if (validationErrors.length) {
    throw new HttpBadRequestError('Malformed path parameters.', {
      details: getErrorDetails(validationErrors)
    });
  }

  return parameters as T;
};
