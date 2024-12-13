import type {
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  UnionSchema
} from '@ez4/schema';

export type HttpAuthResponse = {
  identity?: ObjectSchema | UnionSchema | null;
};

export type HttpResponse = {
  status: number;
  headers?: ObjectSchema | null;
  body?: ObjectSchema | UnionSchema | NumberSchema | StringSchema | BooleanSchema | null;
};
