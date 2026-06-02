import type { StringSchema } from '@ez4/schema';

import { isDateTime } from '@ez4/utils';

import { ExpectedDateTimeFormatError } from '../errors/date-time';
import { registerStringFormat } from '../schema/string';

registerStringFormat('date-time', (value: string, _schema: StringSchema, property?: string) => {
  return isDateTime(value) ? [] : [new ExpectedDateTimeFormatError(property)];
});
