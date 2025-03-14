import type { LinkedVariables } from './service.js';

export type StateOptions = {
  resourcePrefix: string;
  projectName: string;
};

export type DeployOptions = StateOptions & {
  imports?: Record<string, DeployOptions>;
  variables?: LinkedVariables;
  debug?: boolean;
};
