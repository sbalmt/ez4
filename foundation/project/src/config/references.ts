import type { ImportOptions } from '../types/options';
import type { LoadedProjectOptions } from './project';
import type { AliasPaths } from './tsconfig';

import { basename, dirname, relative, resolve } from 'node:path';

import { getServerAddress } from '@ez4/server';
import { toKebabCase } from '@ez4/utils';

import { getServiceBranch, getServicePrefix } from '../utils/resource';
import { getPathsFrom } from './tsconfig';
import { loadProject } from './project';

export type ReferenceProject = {
  project: LoadedProjectOptions;
  imports: Record<string, ImportOptions>;
  paths: AliasPaths;
};

export type ReferenceOverwrites = {
  serverAddress?: string;
  branchName?: string;
};

export const loadReferences = async (project: LoadedProjectOptions, overwrites?: ReferenceOverwrites) => {
  const allReferences: ReferenceProject[] = [];
  const projectsCache = new Set<string>();

  const buildReferences = async (current: LoadedProjectOptions) => {
    const projectPath = resolve(current.projectPath);

    if (projectsCache.has(projectPath)) {
      return;
    }

    projectsCache.add(projectPath);

    const reference: ReferenceProject = {
      paths: await getPathsFrom(current),
      project: current,
      imports: {}
    };

    const { references = {} } = current;

    for (const alias in references) {
      const { projectFile: referenceFile } = references[alias];

      const workspacePath = dirname(resolve(current.workspacePath, referenceFile));
      const referenceProject = await loadProject(basename(referenceFile), workspacePath);

      reference.imports[alias] = getImportOptions(referenceProject, overwrites);

      await buildReferences(referenceProject);
    }

    allReferences.push(reference);
  };

  await buildReferences(project);

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
    main: list.find((reference) => reference.project === project)!,
    list
  };
};

const getImportOptions = (project: LoadedProjectOptions, overwrites?: ReferenceOverwrites): ImportOptions => {
  return {
    prefix: getServicePrefix(project.prefix),
    branchName: getServiceBranch(overwrites?.branchName ?? project.branchName),
    projectName: toKebabCase(project.projectName),
    serviceAddress:
      overwrites?.serverAddress ??
      getServerAddress({
        host: project.serveOptions?.localHost,
        port: project.serveOptions?.localPort
      })
  };
};

const getReferencePaths = (source: AliasPaths, referencePath: string, workspacePath: string): AliasPaths => {
  const paths: AliasPaths = {};

  for (const alias in source) {
    paths[alias] = source[alias].map((path) => {
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
