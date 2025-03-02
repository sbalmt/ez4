import type { NotificationMessageSchema } from '@ez4/notification/library';
import type { FunctionParameters } from '@ez4/aws-function';
import type { ExtraSource } from '@ez4/project/library';

export type SubscriptionFunctionParameters = Omit<FunctionParameters, 'getFunctionBundle'> & {
  messageSchema?: NotificationMessageSchema | null;
  extras?: Record<string, ExtraSource>;
  debug?: boolean;
};
