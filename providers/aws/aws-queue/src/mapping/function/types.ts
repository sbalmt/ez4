import type { QueueMessageSchema } from '@ez4/queue/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type QueueFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type QueueEntryPoint = QueueFunction & {
  dependencies: string[];
};

export type QueueFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'> & {
  handler: QueueEntryPoint;
  listener?: QueueFunction;
  messageSchema?: QueueMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
