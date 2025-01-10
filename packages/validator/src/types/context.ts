import type { ObjectSchema } from '@ez4/schema';

export type ValidationContext = {
  references: Record<number, ObjectSchema>;
  property?: string;
};

export const getNewContext = (property?: string): ValidationContext => {
  return {
    references: {},
    property
  };
};
