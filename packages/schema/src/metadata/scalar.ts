import type { AllType } from '@ez4/reflection';
import type { ScalarSchema } from '../types/type-scalar.js';

import { getBooleanSchema } from './boolean.js';
import { getNumberSchema } from './number.js';
import { getStringSchema } from './string.js';

export const getScalarSchema = (type: AllType, description?: string): ScalarSchema | null => {
  return getBooleanSchema(type, description) || getNumberSchema(type, description) || getStringSchema(type, description);
};
