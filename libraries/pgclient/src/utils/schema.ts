import type { ValidationContextOptions } from '@ez4/validator';
import type { AnySchema } from '@ez4/schema';

import { isDynamicObjectSchema, isObjectSchema, isUnionSchema } from '@ez4/schema';
import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { MalformedRequestError } from '@ez4/pgclient';

export const isDynamicFieldSchema = (schema: AnySchema) => {
  return (isObjectSchema(schema) && isDynamicObjectSchema(schema)) || isUnionSchema(schema);
};

export const validateRecordSchema = (data: unknown, schema: AnySchema, path: string) => {
  return validateSchemaWithContext(data, schema, {
    property: path
  });
};

export const getWithSchemaValidation = async (data: unknown, schema: AnySchema, path: string) => {
  const record = transform(data, schema, createTransformContext({ convert: false }));

  await validateRecordSchema(record, schema, path);

  return record;
};

type ValidateContextOptions = ValidationContextOptions & {
  property: string;
};

const validateSchemaWithContext = async (data: unknown, schema: AnySchema, context: ValidateContextOptions) => {
  const errors = await validate(data, schema, createValidatorContext(context));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);
    const property = context.property;

    throw new MalformedRequestError(property, messages);
  }
};
