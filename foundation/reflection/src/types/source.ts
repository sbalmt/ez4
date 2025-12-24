import type { TypeFunction } from './type-function';
import type { TypeInterface } from './type-interface';
import type { TypeClass } from './type-class';
import type { TypeEnum } from './type-enum';

export type EverySourceType = TypeEnum | TypeClass | TypeInterface | TypeFunction;

export type ReflectionTypes = {
  [id: string]: EverySourceType;
};
