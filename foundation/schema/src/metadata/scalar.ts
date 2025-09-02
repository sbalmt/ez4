import type { AllType } from '@ez4/reflection';
import type { ScalarSchema } from '../types/type-scalar';

import { getBooleanSchema } from './boolean';
import { getNumberSchema } from './number';
import { getStringSchema } from './string';

export const getScalarSchema = (type: AllType, description?: string): ScalarSchema | null => {
  return getBooleanSchema(type, description) || getNumberSchema(type, description) || getStringSchema(type, description);
};
