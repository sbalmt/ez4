import type { StringSchema } from '@ez4/schema';

import { isEmail } from '@ez4/utils';

import { ExpectedEmailTypeError } from '../errors/email.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('email', (value: string, _schema: StringSchema, property?: string) => {
  return isEmail(value) ? [] : [new ExpectedEmailTypeError(property)];
});
