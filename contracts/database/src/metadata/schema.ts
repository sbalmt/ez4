import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableSchema } from '../types/schema';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';
import { createSchemaContext, isObjectSchema } from '@ez4/schema';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectSchemaTypeError, InvalidSchemaTypeError } from '../errors/schema';
import { isTableSchema } from './utils';

type TypeParent = TypeModel | TypeObject;

export const getTableSchema = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeSchema(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeSchema(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getTypeSchema = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]): TableSchema | undefined => {
  if (isTypeObject(type)) {
    return getSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSchemaTypeError(parent.file));
    return undefined;
  }

  if (!isTableSchema(type)) {
    errorList.push(new IncorrectSchemaTypeError(type.name, type.file));
    return undefined;
  }

  return getSchema(type, reflection);
};

const getSchema = (type: TypeObject | TypeModel, reflection: ReflectionTypes) => {
  const schema = getObjectSchema(type, reflection, createSchemaContext({ nullish: true }));

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
