import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { AnySchema, ArraySchema, ObjectSchema, UnionSchema } from '@ez4/schema/library';

import { isTypeArray, isTypeObject, isTypeReference, isTypeScalar, isTypeUndefined, isTypeUnion } from '@ez4/reflection';
import { isObjectSchema, createUnionSchema, getObjectSchema, getScalarSchema, createArraySchema } from '@ez4/schema/library';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body.js';
import { isJsonBody } from './utils.js';

type TypeParent = TypeObject | TypeModel;

export const getHttpRequestBody = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  return getHttpBody(type, reflection, (currentType) => {
    return getCompoundTypeBody(currentType, parent, reflection, errorList);
  });
};

export const getHttpResponseBody = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  return getHttpBody(type, reflection, (currentType) => {
    return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList);
  });
};

const getHttpBody = <T>(type: AllType, reflection: SourceMap, resolver: (type: AllType) => T | null) => {
  if (isTypeUndefined(type)) {
    return null;
  }

  if (!isTypeReference(type)) {
    return resolver(type);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return resolver(statement);
  }

  return null;
};

const getScalarTypeBody = (type: AllType) => {
  if (isTypeScalar(type)) {
    return getScalarSchema(type);
  }

  return null;
};

const getCompoundTypeBody = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
): ObjectSchema | UnionSchema | ArraySchema | null => {
  if (isTypeUnion(type)) {
    return getUnionTypeBody(type.elements, reflection, (currentType) => {
      return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList);
    });
  }

  if (isTypeArray(type)) {
    return getArrayTypeBody(type.element, reflection, (currentType) => {
      return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList);
    });
  }

  if (isTypeObject(type)) {
    return getBodySchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBodyTypeError(parent.file));
    return null;
  }

  if (!isJsonBody(type)) {
    errorList.push(new IncorrectBodyTypeError(type.name, type.file));
    return null;
  }

  return getBodySchema(type, reflection);
};

const getUnionTypeBody = (types: AllType[], reflection: SourceMap, resolver: (type: AllType) => AnySchema | null) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getHttpBody(type, reflection, resolver);

    if (schema) {
      schemaList.push(schema);
    }
  }

  if (!schemaList.length) {
    return null;
  }

  return createUnionSchema({
    elements: schemaList
  });
};

const getArrayTypeBody = (type: AllType, reflection: SourceMap, resolver: (type: AllType) => AnySchema | null) => {
  const schema = getHttpBody(type, reflection, resolver);

  if (schema) {
    return createArraySchema({
      element: schema
    });
  }

  return null;
};

const getBodySchema = (type: TypeObject | TypeModel, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
