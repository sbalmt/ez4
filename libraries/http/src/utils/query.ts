import type { AnySchema, ObjectSchema, NamingStyle } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { createTransformContext, transform } from '@ez4/transform';
import { base64Encode, isNotNullish, isNullish } from '@ez4/utils';
import { getSchemaProperty, isArraySchema } from '@ez4/schema';

export const prepareQueryStrings = <T extends AnyObject>(input: T, schema?: ObjectSchema, namingStyle?: NamingStyle) => {
  if (!schema) {
    return serializeQueryStrings(input);
  }

  const context = createTransformContext({
    outputStyle: namingStyle,
    convert: false
  });

  const payload = transform(input, schema, context) as T;

  return serializeQueryStrings(payload, schema);
};

const serializeQueryStrings = <T extends AnyObject>(query: T, schema?: ObjectSchema) => {
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

const serializeQueryStringValue = (value: unknown, schema?: AnySchema): string | undefined => {
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
