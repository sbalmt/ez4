import type { StringSchema } from '@ez4/schema';

import { isEmail } from '@ez4/utils';

import { ExpectedEmailTypeError } from '../errors/email';
import { registerStringFormat } from '../schema/string';

registerStringFormat('email', (value: string, _schema: StringSchema, property?: string) => {
  return isEmail(value) ? [] : [new ExpectedEmailTypeError(property)];
});
