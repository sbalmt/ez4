import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';

export type CronEventSchema = ObjectSchema | UnionSchema;

export type TargetHandler = FunctionSignature;

export type CronTarget = {
  listener?: ServiceListener;
  handler: TargetHandler;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
