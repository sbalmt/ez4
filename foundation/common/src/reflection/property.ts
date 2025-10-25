import type { EveryType, ModelProperty } from '@ez4/reflection';

import { isTypeObject, isTypeUnion } from '@ez4/reflection';
import { isAnyString, isNullish } from '@ez4/utils';

import { getLiteralBoolean, getLiteralNumber, getLiteralString, getLiteralTuple } from './value';

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

export const getPropertyUnion = (type: ModelProperty) => {
  return isTypeUnion(type.value) ? type.value.elements : null;
};

export const getPropertyNumberList = (member: ModelProperty) => {
  return getPropertyList(member, (element) => getLiteralNumber(element));
};

export const getPropertyStringList = (member: ModelProperty) => {
  return getPropertyList(member, (element) => getLiteralString(element));
};

export const getPropertyStringIn = <T extends string>(type: ModelProperty, values: T[]): T | undefined => {
  const value = getLiteralString(type.value) as T | null | undefined;

  if (isAnyString(value) && values.includes(value)) {
    return value;
  }

  return undefined;
};

const getPropertyList = <T>(member: ModelProperty, getLiteral: (element: EveryType) => NonNullable<T> | null | undefined) => {
  const elements = getPropertyTuple(member) ?? getPropertyUnion(member);

  if (!elements?.length) {
    return null;
  }

  const valuesList = [];

  for (const element of elements) {
    const value = getLiteral(element);

    if (!isNullish(value)) {
      valuesList.push(value);
    }
  }

  return valuesList;
};
