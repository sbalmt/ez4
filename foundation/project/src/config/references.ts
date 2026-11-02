import type { ImportOptions } from '../types/options';
import type { LoadedProjectOptions } from './project';
import type { AliasPaths } from './tsconfig';

import { basename, dirname, relative, resolve } from 'node:path';

import { getServerAddress } from '@ez4/server';
import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';
import { getPathsFrom } from './tsconfig';
import { loadProject } from './project';

export type ProjectReference = {
  project: LoadedProjectOptions;
  imports: Record<string, ImportOptions>;
  paths: AliasPaths;
};

export const loadReferences = async (project: LoadedProjectOptions, serviceAddress?: string) => {
  const projectsCache = new Map<string, ProjectReference>();
  const allReferences: ProjectReference[] = [];

  const getReferences = async (project: LoadedProjectOptions) => {
    const projectPath = resolve(project.projectPath);
    const cacheResult = projectsCache.get(projectPath);

    if (cacheResult) {
      return cacheResult;
    }

    const reference: ProjectReference = {
      paths: await getPathsFrom(project),
      imports: {},
      project
    };

    projectsCache.set(projectPath, reference);

    const { references = {} } = project;

    for (const alias in references) {
      const { projectFile: referenceFile } = references[alias];

      const workspacePath = dirname(resolve(project.workspacePath, referenceFile));
      const referenceOptions = await loadProject(basename(referenceFile), workspacePath);

      reference.imports[alias] = getImportOptions(
        referenceOptions,
        serviceAddress ??
          getServerAddress({
            host: referenceOptions.serveOptions?.localHost,
            port: referenceOptions.serveOptions?.localPort
          })
      );

      await getReferences(referenceOptions);
    }

    allReferences.push(reference);

    return reference;
  };

  const main = await getReferences(project);

  const list = allReferences.map((reference) => {
    const paths: AliasPaths = {};

    for (const projectReference of allReferences) {
      const referencesPaths = getReferencePaths(
        projectReference.paths,
        projectReference.project.workspacePath,
        reference.project.workspacePath
      );

      Object.assign(paths, referencesPaths);
    }

    return {
      ...reference,
      paths
    };
  });

  return {
    main,
    list
  };
};

const getImportOptions = (project: LoadedProjectOptions, serviceHost: string): ImportOptions => {
  return {
    prefix: getServicePrefix(project.prefix),
    branchName: getServiceBranch(project.branchName),
    projectName: toKebabCase(project.projectName),
    serviceHost
  };
};

const getReferencePaths = (source: AliasPaths, referencePath: string, workspacePath: string): AliasPaths => {
  const paths: AliasPaths = {};

  for (const prefix in source) {
    paths[prefix] = source[prefix].map((path) => {
      return `./${relative(workspacePath, resolve(referencePath, path))}`;
    });
  }

  return paths;
};

export const tryLoadReferences = async (projectOptions: LoadedProjectOptions) => {
  try {
    return await loadReferences(projectOptions);
  } catch {
    return {
      main: undefined,
      list: []
    };
  }
};
