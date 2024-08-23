import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type HttpAuthRequest = {
  headers?: ObjectSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
};

export type HttpRequest = {
  headers?: ObjectSchema | null;
  identity?: ObjectSchema | null;
  parameters?: ObjectSchema | null;
  query?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | null;
};
