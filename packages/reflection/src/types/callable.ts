import type { ModelMethod } from './model-method.js';
import type { TypeCallback } from './type-callback.js';
import type { TypeFunction } from './type-function.js';
import type { AllType } from './common.js';

import { isTypeCallback } from './type-callback.js';
import { isTypeFunction } from './type-function.js';
import { isModelMethod } from './model-method.js';

export type TypeCallable = ModelMethod | TypeCallback | TypeFunction;

export const isTypeCallable = (type: AllType): type is TypeCallable => {
  return isModelMethod(type) || isTypeCallback(type) || isTypeFunction(type);
};
