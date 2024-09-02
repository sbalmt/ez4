import type { StringSchema } from '@ez4/schema';

import { ExpectedRegexTypeError } from '../errors/regex.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('regex', (value: string, schema: StringSchema, property?: string) => {
  if (!schema.pattern) {
    return [new ExpectedRegexTypeError(property)];
  }

  const regex = new RegExp(schema.pattern, 'g');

  if (!regex.test(value)) {
    return [new ExpectedRegexTypeError(property)];
  }

  return [];
});
