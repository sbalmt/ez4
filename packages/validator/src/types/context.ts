import type { ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  property?: string;
};

export type ValidationContextOptions = {
  property?: string;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    property: options?.property,
    references: {}
  };
};
