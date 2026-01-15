import type { TupleSchema } from '@ez4/schema';

import { ExpectedTupleTypeError } from '../errors/tuple';
import { createValidatorContext } from '../types/context';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';
import { validateAny } from './any';

export const validateTuple = async (value: unknown, schema: TupleSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, depth, ...currentContext } = context;
  const { definitions } = schema;

  if (!(value instanceof Array)) {
    return [new ExpectedTupleTypeError(property)];
  }

  const allErrors: Error[] = [];

  if (depth > 0) {
    let index = 0;

    for (const elementSchema of schema.elements) {
      const elementProperty = `${property}.${index}`;
      const elementValue = value[index++];

      const errorList = await validateAny(elementValue, elementSchema, {
        ...currentContext,
        inputStyle: context.inputStyle,
        property: elementProperty,
        depth: depth - 1
      });

      allErrors.push(...errorList);
    }
  }

  if (!allErrors.length && definitions?.types && context) {
    return useCustomValidation(value, schema, definitions.types, context);
  }

  return allErrors;
};
