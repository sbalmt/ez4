import type { AnyObject } from '@ez4/utils';
import type { ProjectOptions } from '../types/project';

import { isAnyArray, isAnyObject, isObjectWith } from '@ez4/utils';

import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

import { MissingProjectExportError, MissingProjectFileError, MalformedProjectFileError } from '../errors/project';

const DEFAULT_PROJECT_FILE = 'ez4.project.js';

export const loadProject = async (fileName?: string): Promise<ProjectOptions> => {
  return getProjectFrom(getProjectPath(fileName));
};

export const tryLoadProject = async (fileName?: string, suppress?: boolean): Promise<ProjectOptions> => {
  const path = getProjectPath(fileName);

  if (existsSync(path)) {
    try {
      return await getProjectFrom(path);
    } catch (error) {
      if (!suppress) {
        throw error;
      }
    }
  }

  return {
    projectName: 'unnamed',
    sourceFiles: [],
    stateFile: {
      path: 'ez4-state'
    }
  };
};

export const getProjectFrom = async (path: string): Promise<ProjectOptions> => {
  const projectUrl = pathToFileURL(path).href;
  const projectFile = basename(path);

  try {
    const { default: projectData } = await import(projectUrl);

    if (!projectData) {
      throw new MissingProjectExportError(projectFile);
    }

    validateProject(projectFile, projectData);

    return projectData;
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingProjectFileError(projectFile);
    }

    throw error;
  }
};

const getProjectPath = (fileName?: string) => {
  return join(process.cwd(), fileName || DEFAULT_PROJECT_FILE);
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
