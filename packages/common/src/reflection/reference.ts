import type { AllType, SourceMap, TypeReference } from '@ez4/reflection';

import { isTypeObject, isTypeModel, isModelProperty, isTypeReference } from '@ez4/reflection';
import { getModelMembers } from './model.js';
import { getObjectMembers } from './object.js';
import { getLiteralBoolean, getLiteralNumber, getLiteralString, getLiteralTuple } from './value.js';

export const getReferenceType = (type: TypeReference, reflection: SourceMap): AllType => {
  const reference = reflection[type.path];
  const index = type.index;

  if (!index) {
    return reference;
  }

  const member = getIndexedReferenceMember(reference, index);

  if (!member) {
    throw new Error(`Model ${reference.name} doesn't have the expected ${index} property.`);
  }

  if (!isModelProperty(member)) {
    throw new Error(`Member ${index} on model ${reference.name} isn't a property.`);
  }

  if (isTypeReference(member.value)) {
    return getReferenceType(member.value, reflection);
  }

  return member.value;
};

export const getReferenceBoolean = (type: AllType, reflection: SourceMap) => {
  if (!isTypeReference(type) || !type.index) {
    return null;
  }

  const reference = getReferenceType(type, reflection);

  return getLiteralBoolean(reference);
};

export const getReferenceNumber = (type: AllType, reflection: SourceMap) => {
  if (!isTypeReference(type) || !type.index) {
    return null;
  }

  const reference = getReferenceType(type, reflection);

  return getLiteralNumber(reference);
};

export const getReferenceString = (type: AllType, reflection: SourceMap) => {
  if (!isTypeReference(type) || !type.index) {
    return null;
  }

  const reference = getReferenceType(type, reflection);

  return getLiteralString(reference);
};

export const getReferenceTuple = (type: AllType, reflection: SourceMap) => {
  if (!isTypeReference(type) || !type.index) {
    return null;
  }

  const reference = getReferenceType(type, reflection);

  return getLiteralTuple(reference);
};

const getIndexedReferenceMember = (type: AllType, index: string) => {
  if (isTypeModel(type)) {
    return getModelMembers(type, true).find(({ name }) => name === index);
  }

  if (isTypeObject(type)) {
    return getObjectMembers(type).find(({ name }) => name === index);
  }

  throw new Error(`Model or Object type is expected for index reference.`);
};
