import type { ObjectSchema } from '@ez4/schema';

import { getPropertyName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { isNullish } from '../utils/nullish.js';
import { ExpectedObjectTypeError } from '../errors/object.js';
import { UnexpectedPropertiesError } from '../errors/common.js';
import { createValidatorContext } from '../types/context.js';
import { tryDecodeBase64Json } from '../utils/base64.js';
import { validateAny } from './any.js';

export const validateObject = async (value: unknown, schema: ObjectSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, references, depth } = context;
  const { definitions } = schema;

  if (schema.identity) {
    references[schema.identity] = schema;
  }

  const objectValue = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (!isAnyObject(objectValue)) {
    return [new ExpectedObjectTypeError(property)];
  }

  const allProperties = new Set(Object.keys(objectValue));
  const parentProperty = property;
  const allErrors: Error[] = [];

  const { inputStyle } = context;

  for (const propertyKey in schema.properties) {
    const propertyName = getPropertyName(propertyKey, inputStyle);

    if (depth > 0) {
      const propertyPath = getPropertyPath(propertyName, parentProperty);

      const propertySchema = schema.properties[propertyKey];
      const propertyValue = objectValue[propertyName];

      const errorList = await validateAny(propertyValue, propertySchema, {
        property: propertyPath,
        depth: depth - 1,
        inputStyle,
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
        const propertyValue = objectValue[propertyName];

        const valueErrors = await validateAny(propertyValue, propertyValueSchema, {
          property: propertyPath,
          depth: depth - 1,
          inputStyle,
          references
        });

        allErrors.push(...valueErrors);
      }
    }
  }

  const allowExtraProperties = definitions?.extensible;

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
