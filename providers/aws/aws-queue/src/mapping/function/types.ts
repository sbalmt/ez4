import type { FunctionParameters, FunctionVariables } from '@ez4/aws-function';
import type { QueueMessageSchema } from '@ez4/queue/library';
import type { ContextSource } from '@ez4/project/library';

export type QueueFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type QueueEntryPoint = QueueFunction & {
  dependencies: string[];
};

export type QueueFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'getFunctionVariables' | 'sourceFile' | 'handlerName'
> & {
  handler: QueueEntryPoint;
  listener?: QueueFunction;
  messageSchema?: QueueMessageSchema;
  context?: Record<string, ContextSource>;
  variables: (FunctionVariables | undefined)[];
  debug?: boolean;
};
