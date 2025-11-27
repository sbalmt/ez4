import type { StringSchema, StringSchemaDefinitions } from '@ez4/schema';
import type { TransformContext } from '../types/context';

import { createTransformContext } from '../types/context';

export const transformString = (value: unknown, schema: StringSchema, context = createTransformContext()) => {
  const { definitions } = schema;

  if (value === undefined) {
    return definitions?.default;
  }

  const result = getStringValue(value, definitions, context);

  if (definitions?.value !== undefined && definitions.value !== result && !context.return) {
    return undefined;
  }

  return result;
};

const getStringValue = (value: unknown, definitions: StringSchemaDefinitions | undefined, context: TransformContext) => {
  if (typeof value === 'string') {
    return definitions?.trim ? value.trim() : value;
  }

  if (context.convert && (typeof value === 'number' || typeof value === 'boolean')) {
    return String(value);
  }

  if (!context.return) {
    return undefined;
  }

  return value;
};
