import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';

export type CronEventSchema = ObjectSchema | UnionSchema;

export type TargetHandler = {
  name: string;
  file: string;
  description?: string;
  input?: string;
};

export type CronTarget = {
  handler: TargetHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
