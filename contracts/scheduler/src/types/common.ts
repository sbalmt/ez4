import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type CronEventSchema = ObjectSchema | UnionSchema;

export type TargetHandler = {
  file: string;
  module?: string;
  name: string;
  description?: string;
};

export type CronTarget = {
  listener?: ServiceListener;
  handler: TargetHandler;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
