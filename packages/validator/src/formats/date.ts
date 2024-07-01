import type { StringSchema } from '@ez4/schema';

import { isDate } from '@ez4/utils';

import { ExpectedDateTypeError } from '../errors/date.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('date', (value: string, _schema: StringSchema, property?: string) => {
  return isDate(value) ? [] : [new ExpectedDateTypeError(property)];
});
