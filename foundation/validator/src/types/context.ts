import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  pathStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  property?: string;
  depth: number;
};

export type ValidationContextOptions = {
  pathStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  property?: string;
  depth?: number;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    depth: options?.depth ?? +Infinity,
    pathStyle: options?.pathStyle,
    inputStyle: options?.inputStyle,
    property: options?.property,
    references: {}
  };
};
