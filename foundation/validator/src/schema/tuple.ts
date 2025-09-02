import type { TupleSchema } from '@ez4/schema';

import { isNullish } from '../utils/nullish';
import { createValidatorContext } from '../types/context';
import { ExpectedTupleTypeError } from '../errors/tuple';
import { validateAny } from './any';

export const validateTuple = async (value: unknown, schema: TupleSchema, context = createValidatorContext()) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const { property, references, depth } = context;

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
        inputStyle: context.inputStyle,
        property: elementProperty,
        depth: depth - 1,
        references
      });

      allErrors.push(...errorList);
    }
  }

  return allErrors;
};
