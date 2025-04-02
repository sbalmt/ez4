import type { ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  property?: string;
  depth: number;
};

export type ValidationContextOptions = {
  property?: string;
  depth?: number;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    depth: options?.depth ?? +Infinity,
    property: options?.property,
    references: {}
  };
};
