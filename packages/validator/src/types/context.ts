import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  namingStyle?: NamingStyle;
  property?: string;
  depth: number;
};

export type ValidationContextOptions = {
  namingStyle?: NamingStyle;
  property?: string;
  depth?: number;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    depth: options?.depth ?? +Infinity,
    namingStyle: options?.namingStyle,
    property: options?.property,
    references: {}
  };
};
