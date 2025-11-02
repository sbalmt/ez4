import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, UnionSchema } from '@ez4/schema/library';

import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUndefined, isTypeUnion } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';
import { createUnionSchema } from '@ez4/schema/library';

import { IncorrectIdentityTypeError, InvalidIdentityTypeError } from '../errors/identity';
import { getSchemaFromType } from './schema';
import { isHttpIdentity } from './utils';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpIdentity = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeUndefined(type)) {
    return undefined;
  }

  if (!isTypeReference(type)) {
    return getTypeIdentity(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeIdentity(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getTypeIdentity = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
): ObjectSchema | UnionSchema | undefined => {
  if (isTypeUnion(type)) {
    return getIdentityFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getSchemaFromType(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidIdentityTypeError(parent.file));
    return undefined;
  }

  if (!isHttpIdentity(type)) {
    errorList.push(new IncorrectIdentityTypeError(type.name, parent.file));
    return undefined;
  }

  const schema = getSchemaFromType(type, reflection);

  if (schema) {
    schema.definitions = {
      ...schema.definitions,
      extensible: true
    };
  }

  return schema;
};

const getIdentityFromUnion = (types: AllType[], parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
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
