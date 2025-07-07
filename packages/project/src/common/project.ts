import type { ProjectOptions } from '../types/project.js';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { MissingProjectError } from '../errors/project.js';

export const loadProject = async (fileName?: string): Promise<ProjectOptions> => {
  const projectFile = fileName ?? 'ez4.project.js';
  const projectPath = join(process.cwd(), projectFile);

  const projectUrl = pathToFileURL(projectPath).href;

  const { default: project } = await import(projectUrl);

  if (!project) {
    throw new MissingProjectError(projectPath);
  }

  return project;
};
