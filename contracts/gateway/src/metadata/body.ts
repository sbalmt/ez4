import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { AnySchema, ArraySchema, ObjectSchema, UnionSchema, UnionSchemaData } from '@ez4/schema/library';

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

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body';
import { getSchemaFromType } from './schema';
import { isJsonBody } from './utils';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpBody = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  return getTypeBody(type, reflection, (currentType) => {
    return getScalarTypeBody(currentType) ?? getCompoundTypeBody(currentType, parent, reflection, errorList);
  });
};

const getTypeBody = <T>(type: AllType, reflection: SourceMap, resolver: (type: AllType) => T | undefined) => {
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
  errorList: Error[]
): ObjectSchema | UnionSchema | ArraySchema | undefined => {
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
    return undefined;
  }

  if (!isJsonBody(type)) {
    errorList.push(new IncorrectBodyTypeError(type.name, type.file));
    return undefined;
  }

  return getSchemaFromType(type, reflection);
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

    const schema = getTypeBody(type, reflection, resolver);

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
  const schema = getTypeBody(type, reflection, resolver);

  if (schema) {
    return createArraySchema({
      element: schema
    });
  }

  return undefined;
};
