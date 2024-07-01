import type { TypeInterface } from './type-interface.js';
import type { TypeClass } from './type-class.js';
import type { AllType } from './common.js';

import { isTypeInterface } from './type-interface.js';
import { isTypeClass } from './type-class.js';

export type TypeModel = TypeClass | TypeInterface;

export const isTypeModel = (type: AllType): type is TypeModel => {
  return isTypeClass(type) || isTypeInterface(type);
};
