import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { CommonOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getGeneratorOptions = (input: InputOptions, project: ProjectOptions): CommonOptions => {
  return {
    resourcePrefix: toKebabCase(project.prefix ?? 'ez4'),
    projectName: toKebabCase(project.projectName),
    debug: input.debug ?? project.debugMode,
    force: input.force
  };
};
