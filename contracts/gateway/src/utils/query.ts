import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const resolveQueryStrings = async <T extends Http.QueryStrings>(
  input: T,
  schema: ObjectSchema,
  preferences?: Http.Preferences,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const inputStyle = preferences?.namingStyle;

  const transformContext = createTransformContext({
    convert: true,
    inputStyle
  });

  const payload = transform(input, schema, transformContext);

  const validationContext = createValidatorContext({
    property: '$query',
    pathStyle: inputStyle,
    onCustomValidation
  });

  const validationErrors = await validate(payload, schema, validationContext);

  if (validationErrors.length) {
    throw new HttpBadRequestError('Malformed query strings.', {
      details: getErrorDetails(validationErrors)
    });
  }

  return payload as T;
};
