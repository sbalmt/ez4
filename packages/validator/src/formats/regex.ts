import type { StringSchema } from '@ez4/schema';

import { ExpectedRegexTypeError } from '../errors/regex.js';
import { registerStringFormat } from '../main.js';

registerStringFormat('regex', (value: string, schema: StringSchema, property?: string) => {
  const { extra } = schema;

  if (extra?.pattern) {
    const regex = new RegExp(extra.pattern, 'g');

    if (regex.test(value)) {
      return [];
    }
  }

  return [new ExpectedRegexTypeError(extra?.name, property)];
});
