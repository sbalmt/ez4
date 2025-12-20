import type { AnySchema, NamingStyle, ObjectSchema } from '@ez4/schema';

export type ValidationCustomHandler = (value: unknown, schema: AnySchema, property: string | undefined) => Promise<void> | void;

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  onCustomValidation?: ValidationCustomHandler;
  pathStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  property?: string;
  depth: number;
};

export type ValidationContextOptions = {
  onCustomValidation?: ValidationCustomHandler;
  pathStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  property?: string;
  depth?: number;
};

export const createValidatorContext = (options?: ValidationContextOptions): ValidationContext => {
  return {
    onCustomValidation: options?.onCustomValidation,
    depth: options?.depth ?? +Infinity,
    pathStyle: options?.pathStyle,
    inputStyle: options?.inputStyle,
    property: options?.property,
    references: {}
  };
};
