import type { ValidationContextOptions } from '@ez4/validator';
import type { AnySchema } from '@ez4/schema';

import { isDynamicObjectSchema, isObjectSchema, isUnionSchema } from '@ez4/schema';
import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { createTransformContext, transform } from '@ez4/transform';
import { MalformedRequestError } from '@ez4/pgclient';

export const isDynamicFieldSchema = (schema: AnySchema) => {
  return (isObjectSchema(schema) && isDynamicObjectSchema(schema)) || isUnionSchema(schema);
};

export const validateFirstSchemaLevel = (data: unknown, schema: AnySchema, path: string) => {
  return validateSchemaWithContext(data, schema, {
    property: path,
    depth: 0
  });
};

export const validateAllSchemaLevels = (data: unknown, schema: AnySchema, path: string) => {
  return validateSchemaWithContext(data, schema, {
    property: path,
    depth: Infinity
  });
};

export const getWithSchemaValidation = async (data: unknown, schema: AnySchema, path: string) => {
  const record = transform(data, schema, createTransformContext({ convert: false }));

  await validateAllSchemaLevels(record, schema, path);

  return record;
};

const validateSchemaWithContext = async (data: unknown, schema: AnySchema, context: Required<ValidationContextOptions>) => {
  const errors = await validate(data, schema, createValidatorContext(context));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(context.property, messages);
  }
};
