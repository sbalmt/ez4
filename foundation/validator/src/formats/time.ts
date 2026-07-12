import type { StringSchema } from '@ez4/schema';

import { isTime } from '@ez4/utils';

import { ExpectedTimeFormatError } from '../errors/time';
import { registerStringFormat } from '../schema/string';

registerStringFormat('time', (value: string, _schema: StringSchema, property?: string) => {
  return isTime(value) ? [] : [new ExpectedTimeFormatError(value, property)];
});
