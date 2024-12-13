import type { ObjectSchema } from '@ez4/schema';

export type TransformContext = {
  references: Record<number, ObjectSchema>;
};

export const getNewContext = (): TransformContext => {
  return {
    references: {}
  };
};
