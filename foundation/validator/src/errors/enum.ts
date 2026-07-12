import type { EnumSchemaOption } from '@ez4/schema';

import { UnexpectedValueError } from './common';

export class UnexpectedEnumValueError extends UnexpectedValueError {
  constructor(inputValue: unknown, enumOptions: EnumSchemaOption[], propertyName?: string) {
    super(
      getEnumOptions(enumOptions).join(', '),
      propertyName,
      enumOptions.map(({ value }) => value),
      inputValue
    );
  }
}

const getEnumOptions = (enumOptions: EnumSchemaOption[]) => {
  return enumOptions.map(({ value }) => {
    if (typeof value !== 'string') {
      return value.toString();
    }

    return `'${value}'`;
  });
};
