import type { StringSchema } from '@ez4/schema';

import { ExpectedRegexTypeError } from '../errors/regex';
import { registerStringFormat } from '../schema/string';

registerStringFormat('regex', (value: string, schema: StringSchema, property?: string) => {
  const { definitions } = schema;

  if (definitions?.pattern) {
    const regex = new RegExp(definitions.pattern, 'g');

    if (regex.test(value)) {
      return [];
    }
  }

  return [new ExpectedRegexTypeError(definitions?.name, property)];
});
