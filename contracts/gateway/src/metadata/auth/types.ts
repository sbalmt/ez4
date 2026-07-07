import type { FunctionSignature } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { WebProvider } from '../types';

export type AuthHandler = FunctionSignature & {
  provider?: WebProvider;
  response?: AuthResponse;
  request?: AuthRequest;
  isolated?: boolean;
};

export type AuthResponse = {
  identity?: ObjectSchema | UnionSchema;
};

export type AuthRequest = {
  headers?: ObjectSchema;
  parameters?: ObjectSchema;
  query?: ObjectSchema;
};
