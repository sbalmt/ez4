import type { ObjectSchema } from '@ez4/schema';

import { UnexpectedPropertiesError } from '../errors/common.js';
import { ExpectedObjectTypeError } from '../errors/object.js';
import { isAnyObject } from '@ez4/utils';

import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateObject = async (value: unknown, schema: ObjectSchema, property?: string) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  if (!isAnyObject(value)) {
    return [new ExpectedObjectTypeError(property)];
  }

  const allProperties = new Set(Object.keys(value));
  const parentProperty = property;
  const allErrors: Error[] = [];

  for (const property in schema.properties) {
    allProperties.delete(property);

    const objectProperty = `${parentProperty}.${property}`;
    const valueSchema = schema.properties[property];
    const objectValue = value[property];

    const errorList = await validateAny(objectValue, valueSchema, objectProperty);

    allErrors.push(...errorList);
  }

  if (allProperties.size > 0) {
    const extraProperties = [...allProperties.values()].map((property) => {
      return `${parentProperty}.${property}`;
    });

    allErrors.push(new UnexpectedPropertiesError(extraProperties));
  }

  return allErrors;
};
