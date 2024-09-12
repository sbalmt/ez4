import type { LinkedVariables } from '@ez4/project/library';
import type { TargetHandler } from './handler.js';

export type CronTarget = {
  handler: TargetHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
