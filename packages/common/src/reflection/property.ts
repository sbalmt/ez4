import type { ModelProperty } from '@ez4/reflection';

import { isTypeObject } from '@ez4/reflection';

import { getLiteralBoolean, getLiteralNumber, getLiteralString, getLiteralTuple } from './value.js';

export const getPropertyBoolean = (member: ModelProperty) => {
  return getLiteralBoolean(member.value);
};

export const getPropertyNumber = (type: ModelProperty) => {
  return getLiteralNumber(type.value);
};

export const getPropertyString = (type: ModelProperty) => {
  return getLiteralString(type.value);
};

export const getPropertyTuple = (type: ModelProperty) => {
  return getLiteralTuple(type.value);
};

export const getPropertyObject = (type: ModelProperty) => {
  return isTypeObject(type.value) ? type.value : null;
};
