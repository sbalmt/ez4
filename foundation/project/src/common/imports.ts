import type { ProjectOptions } from '../types/project';
import type { ImportOptions } from '../library';

import { toKebabCase } from '@ez4/utils';

import { getServiceHost } from '../utils/project';
import { loadProject } from './project';

export const loadImports = async (projectOptions: ProjectOptions) => {
  const { importProjects } = projectOptions;

  if (!importProjects) {
    return undefined;
  }

  const allImports: Record<string, ImportOptions> = {};

  for (const alias in importProjects) {
    const { projectFile } = importProjects[alias];

    const project = await loadProject(projectFile);

    allImports[alias] = {
      resourcePrefix: project.prefix ?? 'ez4',
      serviceHost: getServiceHost(project.serveOptions),
      projectName: toKebabCase(project.projectName)
    };
  }

  return allImports;
};
