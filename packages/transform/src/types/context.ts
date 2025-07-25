import type { NamingStyle, ObjectSchema } from '@ez4/schema';

export type TransformContext = {
  references: Record<number, ObjectSchema>;
  namingStyle?: NamingStyle;
  convert?: boolean;
};

export type TransformContextOptions = {
  namingStyle?: NamingStyle;
  convert?: boolean;
};

export const createTransformContext = (options?: TransformContextOptions): TransformContext => {
  return {
    convert: options?.convert ?? true,
    namingStyle: options?.namingStyle,
    references: {}
  };
};
