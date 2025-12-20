import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';
import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUndefined, isTypeUnion } from '@ez4/reflection';
import { createUnionSchema } from '@ez4/schema/library';

import { IncorrectIdentityTypeError, InvalidIdentityTypeError } from '../../errors/auth/identity';
import { getSchemaFromIntersection, getSchemaFromObject } from '../utils/schema';
import { getFullTypeName } from '../utils/type';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

const BASE_TYPE = 'Identity';

export const isAuthIdentityDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getAuthIdentityMetadata = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
) => {
  if (isTypeUndefined(type)) {
    return undefined;
  }

  if (!isTypeReference(type)) {
    return getIdentityType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getIdentityType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const getIdentityType = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
): ObjectSchema | UnionSchema | undefined => {
  if (isTypeObject(type)) {
    return getSchemaFromObject(type, reflection);
  }

  if (isTypeUnion(type)) {
    return getIdentityFromUnion(type.elements, parent, reflection, errorList, namespace);
  }

  if (isTypeIntersection(type)) {
    return getSchemaFromIntersection(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidIdentityTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isAuthIdentityDeclaration(type, namespace)) {
    errorList.push(new IncorrectIdentityTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  const schema = getSchemaFromObject(type, reflection);

  if (schema) {
    schema.definitions = {
      ...schema.definitions,
      extensible: true
    };
  }

  return schema;
};

const getIdentityFromUnion = (types: AllType[], parent: TypeParent, reflection: SourceMap, errorList: Error[], namespace: string) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getAuthIdentityMetadata(type, parent, reflection, errorList, namespace);

    if (schema) {
      schemaList.push(schema);
    }
  }

  if (schemaList.length > 1) {
    return createUnionSchema({
      elements: schemaList
    });
  }

  return schemaList[0];
};
