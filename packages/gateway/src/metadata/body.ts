import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { AnySchema, ArraySchema, ObjectSchema, UnionSchema } from '@ez4/schema/library';

import { createUnionSchema, getScalarSchema, createArraySchema } from '@ez4/schema/library';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import {
  isTypeArray,
  isTypeIntersection,
  isTypeObject,
  isTypeReference,
  isTypeScalar,
  isTypeUndefined,
  isTypeUnion
} from '@ez4/reflection';

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body.js';
import { getSchemaFromType } from './schema.js';
import { isJsonBody } from './utils.js';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpBody = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  return getTypeBody(type, reflection, (currentType) => {
    return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList);
  });
};

const getTypeBody = <T>(type: AllType, reflection: SourceMap, resolver: (type: AllType) => T | null) => {
  if (isTypeUndefined(type)) {
    return null;
  }

  if (!isTypeReference(type)) {
    return resolver(type);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return resolver(declaration);
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

  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getSchemaFromType(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBodyTypeError(parent.file));
    return null;
  }

  if (!isJsonBody(type)) {
    errorList.push(new IncorrectBodyTypeError(type.name, type.file));
    return null;
  }

  return getSchemaFromType(type, reflection);
};

const getUnionTypeBody = (types: AllType[], reflection: SourceMap, resolver: (type: AllType) => AnySchema | null) => {
  const schemaList: AnySchema[] = [];

  let optional: undefined | boolean;

  for (const type of types) {
    if (isTypeUndefined(type)) {
      optional = true;
      continue;
    }

    const schema = getTypeBody(type, reflection, resolver);

    if (schema) {
      schemaList.push(schema);
    }
  }

  if (!schemaList.length) {
    return null;
  }

  return createUnionSchema({
    elements: schemaList,
    optional
  });
};

const getArrayTypeBody = (type: AllType, reflection: SourceMap, resolver: (type: AllType) => AnySchema | null) => {
  const schema = getTypeBody(type, reflection, resolver);

  if (schema) {
    return createArraySchema({
      element: schema
    });
  }

  return null;
};
