import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type TransformContext = {
  references: Record<number, ObjectSchema>;
  outputStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  convert?: boolean;
};

export type TransformContextOptions = {
  outputStyle?: NamingStyle;
  inputStyle?: NamingStyle;
  convert?: boolean;
};

export const createTransformContext = (options?: TransformContextOptions): TransformContext => {
  return {
    convert: options?.convert ?? true,
    outputStyle: options?.outputStyle,
    inputStyle: options?.inputStyle,
    references: {}
  };
};
