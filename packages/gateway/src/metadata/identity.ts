import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectIdentityTypeError, InvalidIdentityTypeError } from '../errors/identity.js';
import { isHttpIdentity } from './utils.js';

export const getHttpIdentity = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
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
) => {
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
    schema.extensible = true;
  }

  return schema;
};
