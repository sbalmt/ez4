import type { ModelProperty } from '@ez4/reflection';

import { isTypeObject } from '@ez4/reflection';
import { isAnyString } from '@ez4/utils';

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

export const getPropertyStringIn = <T extends string>(type: ModelProperty, values: T[]): T | null => {
  const value = getLiteralString(type.value) as T | null | undefined;

  if (isAnyString(value) && values.includes(value)) {
    return value;
  }

  return null;
};

export const getPropertyStringList = (member: ModelProperty) => {
  const elements = getPropertyTuple(member);

  if (!elements?.length) {
    return null;
  }

  const stringList = [];

  for (const element of elements) {
    const value = getLiteralString(element);

    if (value) {
      stringList.push(value);
    }
  }

  return stringList;
};
