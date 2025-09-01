import type { ModelMethod } from './model-method';
import type { TypeCallback } from './type-callback';
import type { TypeFunction } from './type-function';
import type { AllType } from './common';

import { isTypeCallback } from './type-callback';
import { isTypeFunction } from './type-function';
import { isModelMethod } from './model-method';

export type TypeCallable = ModelMethod | TypeCallback | TypeFunction;

export const isTypeCallable = (type: AllType): type is TypeCallable => {
  return isModelMethod(type) || isTypeCallback(type) || isTypeFunction(type);
};
