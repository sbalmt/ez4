import type { ContextSource, LinkedVariables } from '@ez4/project/library';
import type { TopicEventSchema } from '@ez4/topic/library';
import type { FunctionParameters } from '@ez4/aws-function';

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
  'getFunctionFiles' | 'getFunctionBundle' | 'getFunctionHash' | 'getFunctionVariables' | 'sourceFile' | 'handlerName'
> & {
  handler: SubscriptionEntryPoint;
  listener?: SubscriptionFunction;
  eventSchema?: TopicEventSchema;
  context?: Record<string, ContextSource>;
  variables: (LinkedVariables | undefined)[];
  references?: string[];
  debug?: boolean;
};
