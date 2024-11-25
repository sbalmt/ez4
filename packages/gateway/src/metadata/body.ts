import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, ScalarSchema, UnionSchema } from '@ez4/schema/library';

import { isModelDeclaration } from '@ez4/common/library';

import { createUnionSchema, getObjectSchema, getScalarSchema } from '@ez4/schema/library';

import {
  isTypeBoolean,
  isTypeNumber,
  isTypeObject,
  isTypeReference,
  isTypeString,
  isTypeUndefined,
  isTypeUnion
} from '@ez4/reflection';

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body.js';
import { isJsonBody } from './utils.js';

type TypeParent = TypeObject | TypeModel;

export const getHttpRequestBody = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpBody(type, parent, reflection, (type, parent) => {
    return getCompoundTypeBody(type, parent, reflection, errorList);
  });
};

export const getHttpResponseBody = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpBody(type, parent, reflection, (type, parent) => {
    return getScalarTypeBody(type) ?? getCompoundTypeBody(type, parent, reflection, errorList);
  });
};

const getHttpBody = <T>(
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  resolver: (type: AllType, parent: TypeParent) => T | null
) => {
  if (isTypeUndefined(type)) {
    return null;
  }

  if (!isTypeReference(type)) {
    return resolver(type, parent);
  }

  const statement = reflection[type.path];

  if (statement) {
    return resolver(statement, parent);
  }

  return null;
};

const getScalarTypeBody = (type: AllType) => {
  if (isTypeBoolean(type) || isTypeNumber(type) || isTypeString(type)) {
    return getScalarSchema(type);
  }

  return null;
};

const getCompoundTypeBody = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
): ObjectSchema | UnionSchema | null => {
  if (isTypeUnion(type)) {
    return getUnionTypeBody(type.elements, parent, reflection, (type, parent) => {
      return getScalarTypeBody(type) ?? getCompoundTypeBody(type, parent, reflection, errorList);
    });
  }

  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBodyTypeError(parent.file));
    return null;
  }

  if (!isJsonBody(type)) {
    errorList.push(new IncorrectBodyTypeError(type.name, type.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};

const getUnionTypeBody = <T extends ObjectSchema | UnionSchema | ScalarSchema>(
  types: AllType[],
  parent: TypeParent,
  reflection: SourceMap,
  resolver: (type: AllType, parent: TypeParent) => T | null
) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getHttpBody(type, parent, reflection, resolver);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};
