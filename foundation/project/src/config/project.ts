import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

import { MissingProjectExportError, MissingProjectFileError } from '../errors/project';

const DEFAULT_PROJECT_FILE = 'ez4.project.js';

export const loadProject = async (fileName?: string): Promise<ProjectOptions> => {
  return getProjectFrom(getProjectPath(fileName));
};

export const tryLoadProject = (fileName?: string): Promise<ProjectOptions> | ProjectOptions => {
  const path = getProjectPath(fileName);

  if (existsSync(path)) {
    return getProjectFrom(path);
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

  try {
    const { default: project } = await import(projectUrl);

    if (!project) {
      throw new MissingProjectExportError(basename(path));
    }

    return project;
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingProjectFileError(basename(path));
    }

    throw error;
  }
};

const getProjectPath = (fileName?: string) => {
  return join(process.cwd(), fileName || DEFAULT_PROJECT_FILE);
};
