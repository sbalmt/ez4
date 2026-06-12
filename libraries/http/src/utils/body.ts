import type { AnySchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { createTransformContext, transform } from '@ez4/transform';
import { NamingStyle, isScalarSchema } from '@ez4/schema';

export const prepareRequestBody = <T extends AnyObject | string>(input: T, schema?: AnySchema, namingStyle?: NamingStyle) => {
  if (!schema || isScalarSchema(schema)) {
    return {
      body: input.toString(),
      json: false
    };
  }

  const context = createTransformContext({
    outputStyle: namingStyle,
    convert: false
  });

  const payload = transform(input, schema, context);

  return {
    body: JSON.stringify(payload),
    json: true
  };
};

export const prepareResponseBody = (body: string, schema?: AnySchema, namingStyle?: NamingStyle) => {
  if (!schema || isScalarSchema(schema)) {
    return body;
  }

  const payload = JSON.parse(body);

  const context = createTransformContext({
    outputStyle: NamingStyle.Preserve,
    inputStyle: namingStyle,
    convert: false
  });

  return transform(payload, schema, context);
};
