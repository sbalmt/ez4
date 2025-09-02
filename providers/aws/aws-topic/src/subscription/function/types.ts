import type { TopicMessageSchema } from '@ez4/topic/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

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
  'getFunctionBundle' | 'getFunctionFiles' | 'sourceFile' | 'handlerName'
> & {
  handler: SubscriptionEntryPoint;
  listener?: SubscriptionFunction;
  messageSchema?: TopicMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
