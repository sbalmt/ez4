import type { ProjectOptions } from '../types/project';
import type { ImportOptions } from '../library';

import { dirname, join } from 'node:path';

import { getServerAddress } from '@ez4/server';
import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';
import { getPathsFrom } from './tsconfig';
import { loadProject } from './project';

export const loadReferences = async (projectOptions: ProjectOptions, workspacePath?: string) => {
  const { references = {} } = projectOptions;

  const imports: Record<string, ImportOptions> = {};
  const paths: Record<string, string[]> = {};

  for (const alias in references) {
    const { projectFile } = references[alias];

    const projectRoot = join(workspacePath ?? '.', dirname(projectFile));
    const projectOptions = await loadProject(projectFile, projectRoot);
    const projectPaths = await getPathsFrom(projectOptions, projectRoot);

    const { serveOptions } = projectOptions;

    imports[alias] = {
      prefix: getServicePrefix(projectOptions.prefix),
      branchName: getServiceBranch(projectOptions.branchName),
      projectName: toKebabCase(projectOptions.projectName),
      serviceHost: getServerAddress({
        host: serveOptions?.localHost,
        port: serveOptions?.localPort
      })
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
