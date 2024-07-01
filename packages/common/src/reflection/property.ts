import type { ModelProperty } from '@ez4/reflection';

import { isTypeObject, isTypeString, isTypeTuple } from '@ez4/reflection';

export const getPropertyString = (type: ModelProperty) => {
  return isTypeString(type.value) ? type.value.literal : null;
};

export const getPropertyTuple = (type: ModelProperty) => {
  return isTypeTuple(type.value) ? type.value.elements : null;
};

export const getPropertyObject = (type: ModelProperty) => {
  return isTypeObject(type.value) ? type.value : null;
};
