import type { AnySchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

export const useCustomValidation = async (value: unknown, schema: AnySchema, type: string, context: ValidationContext) => {
  const { property, onCustomValidation } = context;

  try {
    if (onCustomValidation) {
      await onCustomValidation(value, { schema, property, type });
    }

    return [];
    //
  } catch (error) {
    if (!(error instanceof Error)) {
      return [new Error(`${error}`)];
    }

    return [error];
  }
};
