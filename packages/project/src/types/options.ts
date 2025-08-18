import type { AnyObject } from '@ez4/utils';
import type { LinkedVariables } from './service.js';

export type CommonOptions = {
  resourcePrefix: string;
  projectName: string;
  debug?: boolean;
};

export type DeployOptions = CommonOptions & {
  force?: boolean;
  imports?: Record<string, DeployOptions>;
  variables?: LinkedVariables;
  tags?: Record<string, string>;
};

export type DestroyOptions = CommonOptions & {
  force?: boolean;
};

export type ServeOptions = CommonOptions & {
  localOptions: Record<string, AnyObject>;
  variables?: LinkedVariables;
  serviceHost: string;
  version: number;
  test?: boolean;
};
