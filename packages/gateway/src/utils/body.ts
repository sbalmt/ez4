import type { AnySchema } from '@ez4/schema';
import type { Http } from '../services/contract.js';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const getRequestBody = async <T extends Http.JsonBody | Http.RawBody>(
  input: T,
  schema: AnySchema,
  preferences?: Http.Preferences | null
): Promise<T> => {
  const inputStyle = preferences?.namingStyle;

  const validationContext = createValidatorContext({
    property: '$body',
    inputStyle
  });

  const validationErrors = await validate(input, schema, validationContext);

  if (validationErrors.length) {
    const messages = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed body payload.', messages);
  }

  const transformContext = createTransformContext({
    convert: false,
    inputStyle
  });

  const payload = transform(input, schema, transformContext);

  return payload as T;
};

export const getResponseBody = (body: unknown, schema: AnySchema, preferences?: Http.Preferences) => {
  const outputStyle = preferences?.namingStyle;

  const context = createTransformContext({
    convert: false,
    outputStyle
  });

  return transform(body, schema, context);
};
