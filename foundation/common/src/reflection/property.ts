import type { EveryType, ModelProperty, SourceMap } from '@ez4/reflection';

import { isTypeObject, isTypeUnion } from '@ez4/reflection';
import { isAnyString, isNullish } from '@ez4/utils';

import { getReferenceBoolean, getReferenceNumber, getReferenceString, getReferenceTuple } from './reference';
import { getLiteralBoolean, getLiteralNumber, getLiteralString, getLiteralTuple } from './value';

export const getPropertyBoolean = (member: ModelProperty, reflection?: SourceMap) => {
  return getLiteralBoolean(member.value) ?? (reflection && getReferenceBoolean(member.value, reflection));
};

export const getPropertyNumber = (member: ModelProperty, reflection?: SourceMap) => {
  return getLiteralNumber(member.value) ?? (reflection && getReferenceNumber(member.value, reflection));
};

export const getPropertyString = (member: ModelProperty, reflection?: SourceMap) => {
  return getLiteralString(member.value) ?? (reflection && getReferenceString(member.value, reflection));
};

export const getPropertyTuple = (member: ModelProperty, reflection?: SourceMap) => {
  return getLiteralTuple(member.value) ?? (reflection && getReferenceTuple(member.value, reflection));
};

export const getPropertyObject = (member: ModelProperty) => {
  return isTypeObject(member.value) ? member.value : undefined;
};

export const getPropertyUnion = (member: ModelProperty) => {
  return isTypeUnion(member.value) ? member.value.elements : undefined;
};

export const getPropertyNumberList = (member: ModelProperty) => {
  return getPropertyList(member, (element) => getLiteralNumber(element));
};

export const getPropertyStringList = (member: ModelProperty) => {
  return getPropertyList(member, (element) => getLiteralString(element));
};

export const getPropertyStringIn = <T extends string>(member: ModelProperty, values: T[]): T | undefined => {
  const value = getLiteralString(member.value) as T | undefined;

  if (isAnyString(value) && values.includes(value)) {
    return value;
  }

  return undefined;
};

const getPropertyList = <T>(member: ModelProperty, getLiteral: (element: EveryType) => NonNullable<T> | undefined) => {
  const elements = getPropertyTuple(member) ?? getPropertyUnion(member);

  if (!elements?.length) {
    return undefined;
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
