import type { LinkedServices, LinkedVariables } from '@ez4/project/library';
import type { FunctionSignature } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type AuthHandler = FunctionSignature & {
  provider?: AuthProvider;
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

export type AuthProvider = {
  variables?: LinkedVariables;
  services?: LinkedServices;
};
