import type { LinkedVariables } from '@ez4/project';
import type { StreamHandler } from './handler.js';

export type TableStream = {
  handler: StreamHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
