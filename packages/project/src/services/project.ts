import type { ProjectOptions } from '../types/project.js';

import { join } from 'node:path';

import { MissingProjectError } from '../errors/project.js';

export const loadProject = async (projectFile?: string): Promise<ProjectOptions> => {
  const projectFilePath = join(process.cwd(), projectFile ?? 'ez4.project.js');

  const { default: project } = await import(projectFilePath);

  if (!project) {
    throw new MissingProjectError(projectFilePath);
  }

  return project;
};
