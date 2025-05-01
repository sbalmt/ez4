import type { QueueMessageSchema } from '@ez4/queue/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type QueueEntryPoint = {
  functionName: string;
  sourceFile: string;
};

export type QueueFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle' | 'sourceFile' | 'handlerName'> & {
  handler: QueueEntryPoint;
  listener?: QueueEntryPoint;
  messageSchema?: QueueMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
