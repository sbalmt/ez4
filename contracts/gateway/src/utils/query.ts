import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/contract';

import { HttpBadRequestError } from '@ez4/gateway';
import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { base64Encode, isNotNullish, isNullish } from '@ez4/utils';
import { getSchemaProperty, isArraySchema } from '@ez4/schema';

export const getQueryStrings = async <T extends Http.QueryStrings>(
  input: T,
  schema: ObjectSchema,
  preferences?: Http.Preferences | null
): Promise<T> => {
  const inputStyle = preferences?.namingStyle;

  const transformContext = createTransformContext({
    convert: true,
    inputStyle
  });

  const payload = transform(input, schema, transformContext);

  const validationContext = createValidatorContext({
    property: '$query',
    pathStyle: inputStyle
  });

  const validationErrors = await validate(payload, schema, validationContext);

  if (validationErrors.length) {
    const messages = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed query strings.', messages);
  }

  return payload as T;
};

export const serializeQueryStrings = <T extends Http.QueryStrings>(query: T, schema?: ObjectSchema) => {
  const queryStrings = [];

  for (const fieldName in query) {
    const fieldSchema = schema && getSchemaProperty(schema, fieldName);
    const fieldResult = serializeQueryStringValue(query[fieldName], fieldSchema);

    if (fieldResult) {
      queryStrings.push(`${fieldName}=${encodeURIComponent(fieldResult)}`);
    }
  }

  if (queryStrings.length) {
    return queryStrings.join('&');
  }

  return undefined;
};

export const serializeQueryStringValue = (value: unknown, schema?: AnySchema): string | undefined => {
  if (isNullish(value)) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Array && (!schema || !isArraySchema(schema) || !schema.definitions?.encoded)) {
    const serialized = value.map((item) => serializeQueryStringValue(item, schema));
    const filtered = serialized.filter((item) => isNotNullish(item));

    return filtered.join(',');
  }

  if (value instanceof Object) {
    return base64Encode(JSON.stringify(value));
  }

  return `${value}`;
};
