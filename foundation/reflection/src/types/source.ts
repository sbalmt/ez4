import type { TypeFunction } from './type-function.js';
import type { TypeInterface } from './type-interface.js';
import type { TypeClass } from './type-class.js';
import type { TypeEnum } from './type-enum.js';

export type EverySourceType = TypeEnum | TypeClass | TypeInterface | TypeFunction;

export type SourceMap = {
  [id: string]: EverySourceType;
};
