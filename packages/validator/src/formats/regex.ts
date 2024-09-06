import type { StringSchema } from '@ez4/schema';

import { ExpectedRegexTypeError } from '../errors/regex.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('regex', (value: string, schema: StringSchema, property?: string) => {
  if (schema.pattern) {
    const regex = new RegExp(schema.pattern, 'g');

    if (regex.test(value)) {
      return [];
    }
  }

  return [new ExpectedRegexTypeError(schema.name, property)];
});
