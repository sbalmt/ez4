import type { StringSchema } from '@ez4/schema';

export type StringFormatHandler = (
  value: string,
  schema: StringSchema,
  property?: string
) => Error[] | Promise<Error[]>;
