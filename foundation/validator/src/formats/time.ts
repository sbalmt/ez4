import type { StringSchema } from '@ez4/schema';

import { isTime } from '@ez4/utils';

import { ExpectedTimeTypeError } from '../errors/time.js';
import { registerStringFormat } from '../schema/string.js';

registerStringFormat('time', (value: string, _schema: StringSchema, property?: string) => {
  return isTime(value) ? [] : [new ExpectedTimeTypeError(property)];
});
