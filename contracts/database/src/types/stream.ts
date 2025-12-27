import type { ServiceArchitecture, ServiceListener, ServiceRuntime } from '@ez4/common/library';
import type { LinkedVariables } from '@ez4/project/library';
import type { StreamHandler } from './handler';

export type TableStream = {
  listener?: ServiceListener;
  handler: StreamHandler;
  variables?: LinkedVariables;
  architecture?: ServiceArchitecture;
  runtime?: ServiceRuntime;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
