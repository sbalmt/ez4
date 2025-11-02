import type { TopicMessageSchema } from '@ez4/topic/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ContextSource } from '@ez4/project/library';

export type SubscriptionFunction = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type SubscriptionEntryPoint = SubscriptionFunction & {
  dependencies: string[];
};

export type SubscriptionFunctionParameters = Omit<
  FunctionParameters,
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'sourceFile' | 'handlerName'
> & {
  handler: SubscriptionEntryPoint;
  listener?: SubscriptionFunction;
  messageSchema?: TopicMessageSchema;
  context?: Record<string, ContextSource>;
  debug?: boolean;
};
