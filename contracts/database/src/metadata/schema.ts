import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableSchema } from '../types/schema';

import { createSchemaContext, getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';
import { isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectSchemaTypeError, InvalidSchemaTypeError } from '../errors/schema';
import { isTableSchema } from './utils';

type TypeParent = TypeModel | TypeObject;

export const getTableSchema = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeSchema(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeSchema(declaration, parent, reflection, errorList);
  }

  return null;
};

const getTypeSchema = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]): TableSchema | null => {
  if (isTypeObject(type)) {
    return getSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidSchemaTypeError(parent.file));
    return null;
  }

  if (!isTableSchema(type)) {
    errorList.push(new IncorrectSchemaTypeError(type.name, type.file));
    return null;
  }

  return getSchema(type, reflection);
};

const getSchema = (type: TypeObject | TypeModel, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection, createSchemaContext({ nullish: true }));

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
