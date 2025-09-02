import type { StringSchema } from '@ez4/schema';

import { isTime } from '@ez4/utils';

import { ExpectedTimeTypeError } from '../errors/time';
import { registerStringFormat } from '../schema/string';

registerStringFormat('time', (value: string, _schema: StringSchema, property?: string) => {
  return isTime(value) ? [] : [new ExpectedTimeTypeError(property)];
});
