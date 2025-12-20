import type { AnySchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

export const useCustomValidation = async (value: unknown, schema: AnySchema, context: ValidationContext) => {
  try {
    await context.onCustomValidation?.(value, schema, context.property);
    return [];
  } catch (error) {
    if (!(error instanceof Error)) {
      return [new Error(`${error}`)];
    }

    return [error];
  }
};
