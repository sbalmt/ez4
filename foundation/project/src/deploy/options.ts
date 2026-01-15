import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { DeployOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getDeployOptions = (input: InputOptions, project: ProjectOptions): DeployOptions => {
  return {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    debug: input.debug ?? project.debugMode,
    defaults: project.defaultOptions,
    release: project.deployOptions,
    variables: project.variables,
    force: input.force,
    tags: project.tags
  };
};
