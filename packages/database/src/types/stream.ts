import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { StreamHandler } from './handler.js';

export type TableStream = {
  listener?: ServiceListener;
  handler: StreamHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
