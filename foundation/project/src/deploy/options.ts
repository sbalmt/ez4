import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { DeployOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';
import { getServiceName } from '../utils/service';

export const getDeployOptions = (input: InputOptions, project: ProjectOptions): DeployOptions => {
  const namingOptions = {
    prefix: getServicePrefix(project.prefix),
    projectName: toKebabCase(project.projectName),
    branchName: getServiceBranch(input.branch ?? project.branchName)
  };

  return {
    ...namingOptions,
    lockId: getServiceName('', namingOptions),
    concurrency: project.deployOptions?.maxConcurrency ?? 25,
    debug: input.debug ?? project.debugMode,
    release: project.deployOptions?.release,
    defaults: project.defaultOptions,
    variables: project.variables,
    force: input.force,
    tags: project.tags
  };
};
