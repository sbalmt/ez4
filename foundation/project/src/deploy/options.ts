import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { DeployOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

const DEFAULT_PREFIX = 'ez4';

export const getDeployOptions = (input: InputOptions, project: ProjectOptions): DeployOptions => {
  const resourcePrefix = project.prefix ?? DEFAULT_PREFIX;

  return {
    projectName: toKebabCase(project.projectName),
    resourcePrefix: toKebabCase(resourcePrefix),
    lockId: toKebabCase(`${resourcePrefix}-${project.projectName}`),
    concurrency: project.deployOptions?.maxConcurrency,
    debug: input.debug ?? project.debugMode,
    release: project.deployOptions?.release,
    defaults: project.defaultOptions,
    variables: project.variables,
    force: input.force,
    tags: project.tags
  };
};
