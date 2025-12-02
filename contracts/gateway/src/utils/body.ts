import type { AnySchema } from '@ez4/schema';
import type { Http } from '../services/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { isScalarSchema, NamingStyle } from '@ez4/schema';
import { HttpBadRequestError } from '@ez4/gateway';

export const prepareRequestBody = <T extends Http.JsonBody | Http.RawBody>(
  input: T,
  schema?: AnySchema,
  preferences?: Http.Preferences
) => {
  if (!schema || isScalarSchema(schema)) {
    return {
      body: input.toString(),
      json: false
    };
  }

  const context = createTransformContext({
    outputStyle: preferences?.namingStyle,
    convert: false
  });

  const payload = transform(input, schema, context);

  return {
    body: JSON.stringify(payload),
    json: true
  };
};

export const getRequestBody = async <T extends Http.JsonBody | Http.RawBody>(
  input: T | undefined,
  schema: AnySchema,
  preferences?: Http.Preferences
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

export const prepareResponseBody = (body: string, schema?: AnySchema, preferences?: Http.Preferences) => {
  if (!schema || isScalarSchema(schema)) {
    return body;
  }

  const payload = JSON.parse(body);

  const context = createTransformContext({
    outputStyle: NamingStyle.Preserve,
    inputStyle: preferences?.namingStyle,
    convert: false
  });

  return transform(payload, schema, context);
};

export const getResponseBody = (body: unknown, schema: AnySchema, preferences?: Http.Preferences) => {
  const outputStyle = preferences?.namingStyle;

  const context = createTransformContext({
    convert: false,
    outputStyle
  });

  return transform(body, schema, context);
};
