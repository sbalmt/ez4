import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { AnySchema, ArraySchema, ObjectSchema, UnionSchema } from '@ez4/schema';
import type { UnionSchemaData } from '@ez4/schema/library';

import { createUnionSchema, getScalarSchema, createArraySchema } from '@ez4/schema/library';
import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';

import {
  isTypeArray,
  isTypeIntersection,
  isTypeObject,
  isTypeReference,
  isTypeScalar,
  isTypeUndefined,
  isTypeUnion
} from '@ez4/reflection';

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body';
import { getSchemaFromIntersection, getSchemaFromObject } from './utils/schema';
import { getFullTypeName } from './utils/type';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

const BASE_TYPE = 'JsonBody';

export const isWebBodyDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebBodyMetadata = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[], namespace: string) => {
  return getBodyType(type, reflection, (currentType) => {
    return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList, namespace);
  });
};

const getBodyType = <T>(type: AllType, reflection: SourceMap, resolver: (type: AllType) => T | undefined) => {
  if (!isTypeUndefined(type)) {
    if (!isTypeReference(type)) {
      return resolver(type);
    }

    const declaration = getReferenceType(type, reflection);

    if (declaration) {
      return resolver(declaration);
    }
  }

  return undefined;
};

const getScalarTypeBody = (type: AllType) => {
  if (isTypeScalar(type)) {
    return getScalarSchema(type);
  }

  return undefined;
};

const getCompoundTypeBody = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
): ObjectSchema | UnionSchema | ArraySchema | undefined => {
  if (isTypeObject(type)) {
    return getSchemaFromObject(type, reflection);
  }

  if (isTypeUnion(type)) {
    return getUnionTypeBody(type.elements, reflection, (currentType) => {
      return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList, namespace);
    });
  }

  if (isTypeIntersection(type)) {
    return getSchemaFromIntersection(type, reflection);
  }

  if (isTypeArray(type)) {
    return getArrayTypeBody(type.element, reflection, (currentType) => {
      return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList, namespace);
    });
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBodyTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isWebBodyDeclaration(type, namespace)) {
    errorList.push(new IncorrectBodyTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), type.file));
    return undefined;
  }

  return getSchemaFromObject(type, reflection);
};

const getUnionTypeBody = (types: AllType[], reflection: SourceMap, resolver: (type: AllType) => AnySchema | undefined) => {
  const schemaData: UnionSchemaData = {
    optional: false,
    elements: []
  };

  for (const type of types) {
    if (isTypeUndefined(type)) {
      schemaData.optional = true;
      continue;
    }

    const schema = getBodyType(type, reflection, resolver);

    if (schema) {
      schemaData.elements.push(schema);
    }
  }

  if (!schemaData.elements.length) {
    return undefined;
  }

  return createUnionSchema(schemaData);
};

const getArrayTypeBody = (type: AllType, reflection: SourceMap, resolver: (type: AllType) => AnySchema | undefined) => {
  const schema = getBodyType(type, reflection, resolver);

  if (schema) {
    return createArraySchema({
      element: schema
    });
  }

  return undefined;
};
