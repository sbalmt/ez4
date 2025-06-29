import type { LinkedVariables } from './service.js';

export type CommonOptions = {
  resourcePrefix: string;
  projectName: string;
};

export type DeployOptions = CommonOptions & {
  force?: boolean;
  debug?: boolean;
  imports?: Record<string, DeployOptions>;
  variables?: LinkedVariables;
  tags?: Record<string, string>;
};

export type DestroyOptions = CommonOptions & {
  force?: boolean;
  debug?: boolean;
};

export type ServeOptions = CommonOptions & {
  port: number;
};
