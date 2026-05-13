import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { CommonOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';

export const getGeneratorOptions = (input: InputOptions, project: ProjectOptions): CommonOptions => {
  return {
    prefix: getServicePrefix(project.prefix),
    projectName: toKebabCase(project.projectName),
    branchName: getServiceBranch(input.branch ?? project.branchName),
    debug: input.debug ?? project.debugMode,
    force: input.force
  };
};
