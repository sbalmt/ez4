import type { ObjectSchema } from '@ez4/schema';

import { getNewContext } from '../types/context.js';
import { UnexpectedPropertiesError } from '../errors/common.js';
import { ExpectedObjectTypeError } from '../errors/object.js';
import { isAnyObject } from '@ez4/utils';

import { isOptionalNullable } from './utils.js';
import { validateAny } from './any.js';

export const validateObject = async (
  value: unknown,
  schema: ObjectSchema,
  context = getNewContext()
) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  const { property, references } = context;

  references[schema.identity] = schema;

  if (!isAnyObject(value)) {
    return [new ExpectedObjectTypeError(property)];
  }

  const allProperties = new Set(Object.keys(value));
  const parentProperty = property;
  const allErrors: Error[] = [];

  for (const propertyName in schema.properties) {
    allProperties.delete(propertyName);

    const propertyPath = getObjectProperty(propertyName, parentProperty);
    const valueSchema = schema.properties[propertyName];
    const childValue = value[propertyName];

    const errorList = await validateAny(childValue, valueSchema, {
      property: propertyPath,
      references
    });

    allErrors.push(...errorList);
  }

  if (schema.additional) {
    const { property: propertySchema, value: valueSchema } = schema.additional;

    for (const propertyName of allProperties) {
      const propertyPath = getObjectProperty(propertyName, parentProperty);
      const childValue = value[propertyName];

      const [propertyErrors, valueErrors] = await Promise.all([
        validateAny(propertyName, propertySchema),
        validateAny(childValue, valueSchema, {
          property: propertyPath,
          references
        })
      ]);

      if (!propertyErrors.length) {
        allProperties.delete(propertyName);
      }

      allErrors.push(...valueErrors);
    }
  }

  const allowExtraProperties = schema.definitions?.extensible;

  if (!allowExtraProperties && allProperties.size > 0) {
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
