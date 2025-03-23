import type { ObjectSchema } from '@ez4/schema';

export type TransformContext = {
  references: Record<number, ObjectSchema>;
  convert?: boolean;
};

export type TransformContextOptions = {
  convert?: boolean;
};

export const createTransformContext = (options?: TransformContextOptions): TransformContext => {
  return {
    convert: options?.convert ?? true,
    references: {}
  };
};
