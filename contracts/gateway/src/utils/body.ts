import type { ValidationCustomContext, ValidationCustomHandler } from '@ez4/validator';
import type { AnySchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { isAnyArray, isAnyObject } from '@ez4/utils';
import { HttpBadRequestError } from '@ez4/gateway';

export const resolveRequestBody = async <T extends Http.JsonBody | Http.RawBody>(
  input: T | undefined,
  schema: AnySchema,
  preferences?: Http.Preferences,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const inputStyle = preferences?.namingStyle;

  const transformContext = createTransformContext({
    convert: false,
    inputStyle
  });

  const useCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    if (isAnyObject(value) || isAnyArray(value)) {
      return onCustomValidation?.(transform(value, context.schema, transformContext), context);
    }

    return onCustomValidation?.(value, context);
  };

  const validationContext = createValidatorContext({
    onCustomValidation: useCustomValidation,
    property: '$body',
    inputStyle
  });

  const validationErrors = await validate(input, schema, validationContext);

  if (validationErrors.length) {
    throw new HttpBadRequestError('Malformed body payload.', {
      details: getErrorDetails(validationErrors)
    });
  }

  const payload = transform(input, schema, transformContext);

  return payload as T;
};

export const resolveResponseBody = (body: unknown, schema: AnySchema, preferences?: Http.Preferences) => {
  const outputStyle = preferences?.namingStyle;

  const context = createTransformContext({
    convert: false,
    outputStyle
  });

  return transform(body, schema, context);
};
