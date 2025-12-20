import type { FunctionSignature } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type AuthHandler = FunctionSignature & {
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
