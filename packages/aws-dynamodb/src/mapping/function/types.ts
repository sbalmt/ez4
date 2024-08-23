import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type StreamFunctionParameters = FunctionParameters & {
  tableSchema?: ObjectSchema | null;
  extras?: Record<string, ExtraSource>;
};
