import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  inputStyle?: NamingStyle;
  property?: string;
  depth: number;
};

export type ValidationContextOptions = {
  inputStyle?: NamingStyle;
  property?: string;
  depth?: number;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    depth: options?.depth ?? +Infinity,
    inputStyle: options?.inputStyle,
    property: options?.property,
    references: {}
  };
};
