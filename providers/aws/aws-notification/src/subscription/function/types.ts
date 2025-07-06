import type { NotificationMessageSchema } from '@ez4/notification/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type SubscriptionFunction = {
  functionName: string;
  sourceFile: string;
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
  messageSchema?: NotificationMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
