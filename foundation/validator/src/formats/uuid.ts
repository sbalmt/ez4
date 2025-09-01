import type { StringSchema } from '@ez4/schema';

import { isUUID } from '@ez4/utils';

import { ExpectedUUIDTypeError } from '../errors/uuid';
import { registerStringFormat } from '../schema/string';

registerStringFormat('uuid', (value: string, _schema: StringSchema, property?: string) => {
  return isUUID(value) ? [] : [new ExpectedUUIDTypeError(property)];
});
