import type { ProjectDefaultOptions, ProjectDeployReleaseOptions } from '@ez4/project';
import type { AnyObject } from '@ez4/utils';
import type { LinkedVariables } from './service';

export type CommonOptions = {
  prefix: string;
  projectName: string;
  branchName: string;
  force?: boolean;
  debug?: boolean;
};

export type ImportOptions = CommonOptions & {
  serviceAddress: string;
};

export type DeployOptions = CommonOptions & {
  lockId: string;
  concurrency?: number;
  workspacePath: string;
  imports?: Record<string, ImportOptions>;
  release?: ProjectDeployReleaseOptions;
  defaults?: ProjectDefaultOptions;
  variables?: LinkedVariables;
  tags?: Record<string, string>;
};

export type DestroyOptions = CommonOptions & {
  force?: boolean;
};

export type ServeOptions = CommonOptions & {
  workspacePath: string;
  serviceAddress: string;
  imports?: Record<string, ImportOptions>;
  localOptions: Record<string, AnyObject>;
  testOptions: Record<string, AnyObject>;
  variables?: LinkedVariables;
  suppress?: boolean;
  reset?: boolean;
  local?: boolean;
  test?: boolean;
};
