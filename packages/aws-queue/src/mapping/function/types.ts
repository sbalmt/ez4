import type { QueueMessageSchema } from '@ez4/queue/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type QueueFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  messageSchema?: QueueMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
