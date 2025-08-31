import type { AllType } from '@ez4/reflection';

import { isTypeBoolean, isTypeNumber, isTypeString, isTypeTuple } from '@ez4/reflection';

export const getLiteralBoolean = (type: AllType) => {
  return isTypeBoolean(type) ? type.literal : null;
};

export const getLiteralNumber = (type: AllType) => {
  return isTypeNumber(type) ? type.literal : null;
};

export const getLiteralString = (type: AllType) => {
  return isTypeString(type) ? type.literal : null;
};

export const getLiteralTuple = (type: AllType) => {
  return isTypeTuple(type) ? type.elements : null;
};
