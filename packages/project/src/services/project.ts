import { MissingProjectError } from '../errors/project.js';
import type { ProjectOptions } from '../types/project.js';

import { join } from 'node:path';

export const loadProject = async (projectFileLocation?: string): Promise<ProjectOptions> => {
  const projectFilePath = join(process.cwd(), projectFileLocation ?? 'ez4.project.js');

  const { project } = await import(projectFilePath);

  if (!project) {
    throw new MissingProjectError(projectFilePath);
  }

  return project;
};
