import type { FunctionParameters as BaseFunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project';
import type { AnySchema } from '@ez4/schema';

export const FunctionServiceName = 'AWS:SQS/Function';

export type FunctionParameters = BaseFunctionParameters & {
  messageSchema?: AnySchema | null;
  extras?: Record<string, ExtraSource>;
};
