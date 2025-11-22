import type { ProjectOptions } from '../types/project';
import type { DeployOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getDeployOptions = (project: ProjectOptions): DeployOptions => {
  return {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    variables: project.variables,
    debug: project.debugMode,
    force: project.forceMode,
    tags: project.tags
  };
};
