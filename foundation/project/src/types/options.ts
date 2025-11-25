import type { AnyObject } from '@ez4/utils';
import type { LinkedVariables } from './service';

export type CommonOptions = {
  resourcePrefix: string;
  projectName: string;
  force?: boolean;
  debug?: boolean;
};

export type ImportOptions = CommonOptions & {
  serviceHost: string;
};

export type DeployOptions = CommonOptions & {
  imports?: Record<string, ImportOptions>;
  variables?: LinkedVariables;
  tags?: Record<string, string>;
};

export type DestroyOptions = CommonOptions & {
  force?: boolean;
};

export type ServeOptions = CommonOptions & {
  imports?: Record<string, ImportOptions>;
  localOptions: Record<string, AnyObject>;
  testOptions: Record<string, AnyObject>;
  variables?: LinkedVariables;
  serviceHost: string;
  suppress?: boolean;
  version: number;
  reset?: boolean;
  local?: boolean;
  test?: boolean;
};
