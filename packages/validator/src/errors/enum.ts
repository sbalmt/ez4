import type { EnumSchemaOption } from '@ez4/schema';

import { UnexpectedValueError } from './common.js';

export class UnexpectedEnumValueError extends UnexpectedValueError {
  constructor(enumOptions: EnumSchemaOption[], propertyName?: string) {
    super(getEnumOptions(enumOptions), propertyName);
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
