import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { isDynamicObjectSchema, isArraySchema, isObjectSchema, isTupleSchema, isUnionSchema } from '@ez4/schema';
import { validate, createValidatorContext, getErrorDetails } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { MalformedRequestError } from '@ez4/pgclient';

export const isJsonLikeField = (schema: AnySchema) => {
  return isObjectSchema(schema) || isUnionSchema(schema) || isArraySchema(schema) || isTupleSchema(schema);
};

export const isDynamicObjectField = (schema: AnySchema): schema is ObjectSchema => {
  return isObjectSchema(schema) && isDynamicObjectSchema(schema);
};

export const isDynamicUnionField = (schema: AnySchema): boolean => {
  return isUnionSchema(schema) && schema.elements.some((element) => isDynamicObjectField(element) || isDynamicUnionField(element));
};

export const validateRecordSchema = async (data: unknown, schema: AnySchema, path: string) => {
  const context = createValidatorContext({ property: path });
  const errors = await validate(data, schema, context);

  if (errors.length) {
    throw new MalformedRequestError(path, getErrorDetails(errors));
  }
};

export const getWithSchemaValidation = async (data: unknown, schema: AnySchema, path: string) => {
  const record = transform(data, schema, createTransformContext({ convert: false }));

  await validateRecordSchema(record, schema, path);

  return record;
};
