import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { MissingProjectError, MissingProjectFileError } from '../errors/project';

export const loadProject = async (fileName?: string): Promise<ProjectOptions> => {
  const projectFile = fileName ?? 'ez4.project.js';
  const projectPath = join(process.cwd(), projectFile);

  const projectUrl = pathToFileURL(projectPath).href;

  try {
    const { default: project } = await import(projectUrl);

    if (!project) {
      throw new MissingProjectError(projectFile);
    }

    return project;
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingProjectFileError(projectFile);
    }

    throw error;
  }
};

export const tryLoadProject = async (fileName?: string): Promise<ProjectOptions> => {
  try {
    return await loadProject(fileName);
  } catch {
    return {
      projectName: 'unnamed',
      sourceFiles: [],
      stateFile: {
        path: 'ez4-state'
      }
    };
  }
};
