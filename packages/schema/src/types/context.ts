import type { AllType } from '@ez4/reflection';

export type SchemaContext = {
  references: WeakMap<AllType, number>;
  counter: number;
};

export const getNewContext = (): SchemaContext => {
  return {
    references: new WeakMap<AllType, number>(),
    counter: 0
  };
};