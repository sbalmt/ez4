import type { AnySchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { ValidationError } from '../errors/common';

export const useCustomValidation = async (value: unknown, schema: AnySchema, types: string[], context: ValidationContext) => {
  const { property, onCustomValidation } = context;

  if (!onCustomValidation) {
    return [];
  }

  try {
    for (const type of types) {
      await onCustomValidation(value, { schema, property, type });
    }

    return [];
    //
  } catch (error) {
    if (!(error instanceof Error)) {
      return [new ValidationError(`${error}`, property, value)];
    }

    if (!(error instanceof ValidationError)) {
      return [new ValidationError(error.message, property, value, error)];
    }

    return [error];
  }
};
