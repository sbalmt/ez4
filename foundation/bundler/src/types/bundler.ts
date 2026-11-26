import type { LinkedContext } from '@ez4/project/library';

export type BundlerEntrypoint = {
  functionName: string;
  sourceFile: string;
  module?: string;
};

export type BundlerOptions = {
  filePrefix: string;
  templateFile: string;
  entrypointFile?: string;
  workspacePath?: string;
  resourceName: string;
  projectPrefix: string;
  projectBranch: string;
  projectName: string;
  listener?: BundlerEntrypoint;
  middlewares?: BundlerEntrypoint[];
  handler: BundlerEntrypoint;
  context?: Record<string, LinkedContext>;
  define?: Record<string, string>;
  debug?: boolean;
  target?: string;
};
