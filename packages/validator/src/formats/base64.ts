import type { StringSchema } from '@ez4/schema';

import { isBase64 } from '@ez4/utils';

import { ExpectedBase64TypeError } from '../errors/base64.js';
import { registerStringFormat } from '../schema/string.js';

registerStringFormat('base64', (value: string, _schema: StringSchema, property?: string) => {
  return isBase64(value) ? [] : [new ExpectedBase64TypeError(property)];
});
