import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type TransformContext = {
  references: Record<number, ObjectSchema>;
  outputStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  convert?: boolean;
  return?: boolean;
  partial: boolean;
};

export type TransformContextOptions = {
  outputStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  convert?: boolean;
  return?: boolean;
};

export const createTransformContext = (options?: TransformContextOptions): TransformContext => {
  return {
    inputStyle: options?.inputStyle,
    outputStyle: options?.outputStyle,
    convert: options?.convert ?? true,
    return: options?.return ?? true,
    partial: false,
    references: {}
  };
};
