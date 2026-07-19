import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { isDynamicObjectSchema, isObjectSchema } from '@ez4/schema';
import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { MalformedRequestError } from '@ez4/aws-dynamodb/runtime';

export const isDynamicFieldSchema = (schema: AnySchema): schema is ObjectSchema => {
  return isObjectSchema(schema) && isDynamicObjectSchema(schema);
};

export const validateRecordSchema = async (data: unknown, schema: AnySchema, path: string) => {
  const context = createValidatorContext({ property: path });
  const errors = await validate(data, schema, context);

  if (errors.length) {
    throw new MalformedRequestError(path, getErrorDetails(errors));
  }
};

export const getWithSchemaValidation = async <T>(data: unknown, schema: AnySchema, path: string) => {
  const record = transform(data, schema, createTransformContext({ convert: false }));

  await validateRecordSchema(record, schema, path);

  return record as T;
};
