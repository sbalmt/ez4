import type { ValidationContextOptions } from '@ez4/validator';
import type { AnySchema } from '@ez4/schema';

import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { MalformedRequestError } from '@ez4/pgclient';

export const validateSchemaWithContext = async (data: unknown, schema: AnySchema, context: Required<ValidationContextOptions>) => {
  const errors = await validate(data, schema, createValidatorContext(context));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new MalformedRequestError(context.property, messages);
  }
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
