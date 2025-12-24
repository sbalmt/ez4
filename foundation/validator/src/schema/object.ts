import type { ObjectSchema } from '@ez4/schema';

import { getPropertyName } from '@ez4/schema';
import { isAnyObject } from '@ez4/utils';

import { ExpectedObjectTypeError } from '../errors/object';
import { UnexpectedPropertiesError } from '../errors/common';
import { createValidatorContext } from '../types/context';
import { tryDecodeBase64Json } from '../utils/base64';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';
import { validateAny } from './any';

export const validateObject = async (value: unknown, schema: ObjectSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property: parentProperty, references, depth, inputStyle, pathStyle = inputStyle, ...currentContext } = context;
  const { definitions } = schema;

  if (schema.identity) {
    references[schema.identity] = schema;
  }

  const objectValue = definitions?.encoded ? tryDecodeBase64Json(value) : value;

  if (!isAnyObject(objectValue)) {
    return [new ExpectedObjectTypeError(parentProperty)];
  }

  const allProperties = new Set(Object.keys(objectValue));
  const allErrors: Error[] = [];

  for (const propertyKey in schema.properties) {
    const propertyName = getPropertyName(propertyKey, inputStyle);

    if (depth > 0) {
      const propertyPath = getPropertyName(propertyKey, pathStyle);

      const propertySchema = schema.properties[propertyKey];
      const propertyValue = objectValue[propertyName];

      const errorList = await validateAny(propertyValue, propertySchema, {
        ...currentContext,
        property: getPropertyPath(propertyPath, parentProperty),
        depth: depth - 1,
        references,
        inputStyle,
        pathStyle
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
        const propertyPath = getPropertyName(propertyName, pathStyle);
        const propertyValue = objectValue[propertyName];

        const valueErrors = await validateAny(propertyValue, propertyValueSchema, {
          ...currentContext,
          property: getPropertyPath(propertyPath, parentProperty),
          depth: depth - 1,
          references,
          inputStyle,
          pathStyle
        });

        allErrors.push(...valueErrors);
      }
    }
  }

  const allowExtraProperties = definitions?.extensible;

  if (!allowExtraProperties && allProperties.size > 0) {
    const extraProperties = [...allProperties.values()].map((propertyName) => {
      return getPropertyPath(propertyName, parentProperty);
    });

    allErrors.push(new UnexpectedPropertiesError(extraProperties));
  }

  if (!allErrors.length && definitions?.type && context) {
    return useCustomValidation(value, schema, definitions.type, context);
  }

  return allErrors;
};

const getPropertyPath = (childProperty: string, parentProperty: string | undefined) => {
  return parentProperty ? `${parentProperty}.${childProperty}` : childProperty;
};
