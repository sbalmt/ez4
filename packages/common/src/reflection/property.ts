import type { ModelProperty } from '@ez4/reflection';

import {
  isTypeBoolean,
  isTypeNumber,
  isTypeString,
  isTypeTuple,
  isTypeObject
} from '@ez4/reflection';

export const getPropertyBoolean = (type: ModelProperty) => {
  return isTypeBoolean(type.value) ? type.value.literal : null;
};

export const getPropertyNumber = (type: ModelProperty) => {
  return isTypeNumber(type.value) ? type.value.literal : null;
};

export const getPropertyString = (type: ModelProperty) => {
  return isTypeString(type.value) ? type.value.literal : null;
};

export const getPropertyTuple = (type: ModelProperty) => {
  return isTypeTuple(type.value) ? type.value.elements : null;
};

export const getPropertyObject = (type: ModelProperty) => {
  return isTypeObject(type.value) ? type.value : null;
};
