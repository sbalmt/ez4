import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { DeployOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getDeployOptions = (input: InputOptions, project: ProjectOptions): DeployOptions => {
  return {
    projectName: toKebabCase(project.projectName),
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    concurrency: project.deployOptions?.maxConcurrency,
    debug: input.debug ?? project.debugMode,
    release: project.deployOptions?.release,
    defaults: project.defaultOptions,
    variables: project.variables,
    force: input.force,
    tags: project.tags
  };
};
