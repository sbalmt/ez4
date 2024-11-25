import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, UnionSchema } from '@ez4/schema/library';

import { isTypeObject, isTypeReference, isTypeUndefined, isTypeUnion } from '@ez4/reflection';
import { createUnionSchema, getObjectSchema } from '@ez4/schema/library';
import { isModelDeclaration } from '@ez4/common/library';

import { IncorrectIdentityTypeError, InvalidIdentityTypeError } from '../errors/identity.js';
import { isHttpIdentity } from './utils.js';

export const getHttpIdentity = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeUndefined(type)) {
    return null;
  }

  if (!isTypeReference(type)) {
    return getTypeIdentity(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeIdentity(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeIdentity = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
): ObjectSchema | UnionSchema | null => {
  if (isTypeUnion(type)) {
    return getIdentityFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidIdentityTypeError(parent.file));
    return null;
  }

  if (!isHttpIdentity(type)) {
    errorList.push(new IncorrectIdentityTypeError(type.name, parent.file));
    return null;
  }

  const schema = getObjectSchema(type, reflection);

  if (schema) {
    schema.extra = {
      ...schema.extra,
      extensible: true
    };
  }

  return schema;
};

const getIdentityFromUnion = (
  types: AllType[],
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getHttpIdentity(type, parent, reflection, errorList);

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
