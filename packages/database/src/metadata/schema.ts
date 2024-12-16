import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { TableSchema } from '../types/schema.js';

import { getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { isModelDeclaration } from '@ez4/common/library';

import { IncorrectSchemaTypeError, InvalidSchemaTypeError } from '../errors/schema.js';
import { isTableSchema } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getTableSchema = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeSchema(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeSchema(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeSchema = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
): TableSchema | null => {
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
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
