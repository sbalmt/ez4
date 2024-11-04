import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type QueueFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  messageSchema?: ObjectSchema | UnionSchema | null;
  extras?: Record<string, ExtraSource>;
};
