import type { LoadedProjectOptions } from '../config/project';
import type { InputOptions } from '../terminal/options';
import type { ServeOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';

export const getServeOptions = (input: InputOptions, project: LoadedProjectOptions): ServeOptions => {
  const { serveOptions, workspacePath } = project;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  return {
    prefix: getServicePrefix(project.prefix),
    projectName: toKebabCase(project.projectName),
    branchName: getServiceBranch(input.branch ?? project.branchName),
    serviceAddress: `${serviceHost}:${servicePort}`,
    localOptions: project.localOptions ?? {},
    testOptions: project.testOptions ?? {},
    debug: input.debug ?? project.debugMode,
    reset: input.reset ?? project.resetMode,
    local: input.local ?? project.localMode,
    variables: project.variables,
    suppress: input.suppress,
    workspacePath
  };
};
