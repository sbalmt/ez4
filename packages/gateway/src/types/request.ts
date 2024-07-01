import type { AnySchema } from '@ez4/schema';

export type HttpRequest = {
  query?: AnySchema | null;
  parameters?: AnySchema | null;
  body?: AnySchema | null;
};
