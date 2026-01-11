import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const resolveHeaders = async <T extends Http.Headers>(
  input: T,
  schema: ObjectSchema,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const headers = transform(input, schema, createTransformContext({ convert: false }));

  const validationContext = createValidatorContext({
    property: '$header',
    onCustomValidation
  });

  const validationErrors = await validate(headers, schema, validationContext);

  if (validationErrors.length) {
    throw new HttpBadRequestError('Malformed request headers.', {
      details: getUniqueErrorMessages(validationErrors)
    });
  }

  return headers as T;
};
