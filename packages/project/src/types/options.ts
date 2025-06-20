import type { LinkedVariables } from './service.js';

export type StateOptions = {
  resourcePrefix: string;
  projectName: string;
  force?: boolean;
  debug?: boolean;
};

export type DeployOptions = StateOptions & {
  imports?: Record<string, DeployOptions>;
  variables?: LinkedVariables;
  tags?: Record<string, string>;
};
