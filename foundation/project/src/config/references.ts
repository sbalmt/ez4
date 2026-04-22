import type { ProjectOptions } from '../types/project';
import type { ImportOptions } from '../library';

import { dirname, join } from 'node:path';

import { toKebabCase } from '@ez4/utils';

import { getServiceHost } from '../utils/project';
import { getPathsFrom } from './tsconfig';
import { loadProject } from './project';

export const loadReferences = async (projectOptions: ProjectOptions) => {
  const { references = {} } = projectOptions;

  const imports: Record<string, ImportOptions> = {};
  const paths: Record<string, string[]> = {};

  for (const alias in references) {
    const { projectFile } = references[alias];

    const projectRoot = dirname(projectFile);
    const projectOptions = await loadProject(projectFile);
    const projectPaths = await getPathsFrom(projectRoot, projectOptions);

    imports[alias] = {
      resourcePrefix: projectOptions.prefix ?? 'ez4',
      serviceHost: getServiceHost(projectOptions.serveOptions),
      projectName: toKebabCase(projectOptions.projectName)
    };

    for (const prefix in projectPaths) {
      const prefixPaths = projectPaths[prefix];

      if (prefixPaths) {
        paths[prefix] = prefixPaths.map((globPath) => {
          return join(projectRoot, globPath);
        });
      }
    }
  }

  return {
    imports,
    paths
  };
};

export const tryLoadReferences = async (projectOptions: ProjectOptions) => {
  try {
    return await loadReferences(projectOptions);
  } catch {
    return {
      imports: {},
      paths: {}
    };
  }
};
