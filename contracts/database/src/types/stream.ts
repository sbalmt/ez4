import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { StreamHandler } from './handler';

export type TableStream = {
  listener?: ServiceListener;
  handler: StreamHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};
