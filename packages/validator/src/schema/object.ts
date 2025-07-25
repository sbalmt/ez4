import type { ObjectSchema } from '@ez4/schema';

import { getPropertyName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { ExpectedObjectTypeError } from '../errors/object.js';
import { UnexpectedPropertiesError } from '../errors/common.js';
import { createValidatorContext } from '../types/context.js';
import { isNullish } from '../utils/nullish.js';
import { validateAny } from './any.js';

export const validateObject = async (value: unknown, schema: ObjectSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, references, depth } = context;

  if (schema.identity) {
    references[schema.identity] = schema;
  }

  if (!isAnyObject(value)) {
    return [new ExpectedObjectTypeError(property)];
  }

  const allProperties = new Set(Object.keys(value));
  const parentProperty = property;
  const allErrors: Error[] = [];

  const { namingStyle } = context;

  for (const propertyKey in schema.properties) {
    const propertyName = getPropertyName(propertyKey, namingStyle);

    if (depth > 0) {
      const propertyPath = getPropertyPath(propertyName, parentProperty);

      const propertySchema = schema.properties[propertyKey];
      const propertyValue = value[propertyName];

      const errorList = await validateAny(propertyValue, propertySchema, {
        property: propertyPath,
        depth: depth - 1,
        namingStyle,
        references
      });

      allErrors.push(...errorList);
    }

    allProperties.delete(propertyName);
  }

  if (schema.additional) {
    const { property: propertyNameSchema, value: propertyValueSchema } = schema.additional;

    for (const propertyName of allProperties) {
      const propertyErrors = await validateAny(propertyName, propertyNameSchema);

      if (!propertyErrors.length) {
        allProperties.delete(propertyName);
      }

      if (depth > 0) {
        const propertyPath = getPropertyPath(propertyName, parentProperty);
        const propertyValue = value[propertyName];

        const valueErrors = await validateAny(propertyValue, propertyValueSchema, {
          property: propertyPath,
          depth: depth - 1,
          namingStyle,
          references
        });

        allErrors.push(...valueErrors);
      }
    }
  }

  const allowExtraProperties = schema.definitions?.extensible;

  if (!allowExtraProperties && allProperties.size > 0) {
    const extraProperties = [...allProperties.values()].map((property) => {
      return getPropertyPath(property, parentProperty);
    });

    allErrors.push(new UnexpectedPropertiesError(extraProperties));
  }

  return allErrors;
};

const getPropertyPath = (childProperty: string, parentProperty: string | undefined) => {
  return parentProperty ? `${parentProperty}.${childProperty}` : childProperty;
};
