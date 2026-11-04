import type { AnyObject } from '@ez4/utils';
import type { ProjectOptions } from '../types/project';

import { isAnyArray, isAnyObject, isObjectWith } from '@ez4/utils';

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { MissingProjectExportError, MissingProjectFileError, MalformedProjectFileError } from '../errors/project';

const DEFAULT_PROJECT_FILE = 'ez4.project.js';

export type LoadedProjectOptions = ProjectOptions & {
  workspacePath: string;
  projectPath: string;
};

type ProjectLocation = {
  projectFile: string;
  projectPath: string;
  workspacePath: string;
};

export const loadProject = async (fileName?: string, workspacePath?: string): Promise<LoadedProjectOptions> => {
  const location = getProjectLocation(fileName, workspacePath);

  return getProjectFrom(location);
};

export const tryLoadProject = async (fileName?: string, workspacePath?: string, suppress?: boolean): Promise<LoadedProjectOptions> => {
  const location = getProjectLocation(fileName, workspacePath);

  if (existsSync(location.projectPath)) {
    try {
      return await getProjectFrom(location);
    } catch (error) {
      if (!suppress) {
        throw error;
      }
    }
  }

  return {
    ...location,
    projectName: 'unnamed',
    sourceFiles: [],
    stateFile: {
      path: 'ez4-state'
    }
  };
};

export const getProjectFrom = async (location: ProjectLocation): Promise<LoadedProjectOptions> => {
  const { projectPath, projectFile } = location;

  const projectUrl = pathToFileURL(projectPath).href;

  try {
    const { default: options } = await import(projectUrl);

    if (!options) {
      throw new MissingProjectExportError(projectFile);
    }

    validateProject(projectFile, options);

    return {
      ...options,
      ...location
    };
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingProjectFileError(projectFile);
    }

    throw error;
  }
};

const getProjectLocation = (fileName?: string, workspacePath?: string): ProjectLocation => {
  const currentWorkspacePath = workspacePath || process.cwd();
  const currentProjectFile = fileName || DEFAULT_PROJECT_FILE;

  return {
    projectFile: currentProjectFile,
    projectPath: join(currentWorkspacePath, currentProjectFile),
    workspacePath: currentWorkspacePath
  };
};

const validateProject = (projectFile: string, projectData: AnyObject) => {
  const invalidProperties = [];

  if (!projectData.projectName) {
    invalidProperties.push('projectName');
  }

  if (!isAnyObject(projectData.stateFile) || !isObjectWith(projectData.stateFile, ['path'])) {
    invalidProperties.push('stateFile');
  }

  if (!isAnyArray(projectData.sourceFiles)) {
    invalidProperties.push('sourceFiles');
  }

  if (invalidProperties.length) {
    throw new MalformedProjectFileError(projectFile, invalidProperties);
  }
};
