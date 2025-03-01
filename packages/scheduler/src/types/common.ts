import type { LinkedVariables } from '@ez4/project/library';

export type TargetHandler = {
  name: string;
  file: string;
  description?: string;
};

export type CronTarget = {
  handler: TargetHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
