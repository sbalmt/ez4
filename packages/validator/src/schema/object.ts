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

  for (const childProperty in schema.properties) {
    allProperties.delete(childProperty);

    const propertyPath = getObjectProperty(childProperty, parentProperty);
    const childSchema = schema.properties[childProperty];
    const childValue = value[childProperty];

    const errorList = await validateAny(childValue, childSchema, propertyPath);

    allErrors.push(...errorList);
  }

  if (!schema.extensible && allProperties.size > 0) {
    const extraProperties = [...allProperties.values()].map((property) => {
      return getObjectProperty(property, parentProperty);
    });

    allErrors.push(new UnexpectedPropertiesError(extraProperties));
  }

  return allErrors;
};

const getObjectProperty = (childProperty: string, parentProperty: string | undefined) => {
  return parentProperty ? `${parentProperty}.${childProperty}` : childProperty;
};
