import type { ProjectOptions } from '../types/project';
import type { CommonOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getGeneratorOptions = (project: ProjectOptions): CommonOptions => {
  return {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    debug: project.debugMode,
    force: project.forceMode
  };
};
