import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

import { MissingProjectError, MissingProjectFileError } from '../errors/project';

export const loadProject = async (fileName?: string): Promise<ProjectOptions> => {
  return getConfiguration(getProjectPath(fileName));
};

export const tryLoadProject = (fileName?: string): Promise<ProjectOptions> | ProjectOptions => {
  const path = getProjectPath(fileName);

  if (existsSync(path)) {
    return getConfiguration(path);
  }

  return {
    projectName: 'unnamed',
    sourceFiles: [],
    stateFile: {
      path: 'ez4-state'
    }
  };
};

const getProjectPath = (fileName?: string) => {
  return join(process.cwd(), fileName ?? 'ez4.project.js');
};

const getConfiguration = async (path: string): Promise<ProjectOptions> => {
  const projectUrl = pathToFileURL(path).href;

  try {
    const { default: project } = await import(projectUrl);

    if (!project) {
      throw new MissingProjectError(basename(path));
    }

    return project;
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingProjectFileError(basename(path));
    }

    throw error;
  }
};
