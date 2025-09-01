import type { TypeInterface } from './type-interface';
import type { TypeClass } from './type-class';
import type { AllType } from './common';

import { isTypeInterface } from './type-interface';
import { isTypeClass } from './type-class';

export type TypeModel = TypeClass | TypeInterface;

export const isTypeModel = (type: AllType): type is TypeModel => {
  return isTypeClass(type) || isTypeInterface(type);
};
