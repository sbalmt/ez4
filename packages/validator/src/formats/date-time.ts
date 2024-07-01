import type { StringSchema } from '@ez4/schema';

import { isDateTime } from '@ez4/utils';

import { ExpectedDateTimeTypeError } from '../errors/date-time.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('date-time', (value: string, _schema: StringSchema, property?: string) => {
  return isDateTime(value) ? [] : [new ExpectedDateTimeTypeError(property)];
});
