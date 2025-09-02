import type { AllType } from '@ez4/reflection';
import type { NamingStyle } from './naming';

export type SchemaContext = {
  references: WeakMap<AllType, number>;
  namingStyle?: NamingStyle;
  nullish?: boolean;
  counter: number;
};

export type SchemaContextOptions = {
  namingStyle?: NamingStyle;
  nullish?: boolean;
};

export const createSchemaContext = (options?: SchemaContextOptions): SchemaContext => {
  return {
    references: new WeakMap<AllType, number>(),
    namingStyle: options?.namingStyle,
    nullish: options?.nullish,
    counter: 0
  };
};
