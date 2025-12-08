import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type AuthHandler = {
  name: string;
  module?: string;
  file: string;
  description?: string;
  response?: AuthResponse;
  request?: AuthRequest;
};

export type AuthResponse = {
  identity?: ObjectSchema | UnionSchema;
};

export type AuthRequest = {
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
};
