import type { AllType } from '@ez4/reflection';
import type { NamingStyle } from './common.js';

export type SchemaContext = {
  references: WeakMap<AllType, number>;
  namingStyle?: NamingStyle;
  counter: number;
};

export type SchemaContextOptions = {
  namingStyle?: NamingStyle;
};

export const createSchemaContext = (options?: SchemaContextOptions): SchemaContext => {
  return {
    references: new WeakMap<AllType, number>(),
    namingStyle: options?.namingStyle,
    counter: 0
  };
};
