import type { ServiceManifest } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

import { basename, dirname } from 'node:path';
import { workspace } from 'vscode';

import { tryLoadProject } from '@ez4/project/library';
import { sortObject, toKebabCase } from '@ez4/utils';

import { LoggerService } from './logger';

export type WorkspaceManifest = {
  manifest?: Record<string, ServiceManifest<ObjectSchema>>;
  location: string;
  project: string;
};

export namespace ManifestService {
  export const fetchAll = async () => {
    const files = await workspace.findFiles('**/ez4.project.js', '**/node_modules');

    const projects: WorkspaceManifest[] = [];

    const logger = LoggerService.get();

    const allOperations = files.map(async (file) => {
      const workspacePath = dirname(file.path);
      const projectFile = basename(file.path);

      logger.debug(`Project found at:`, workspacePath);

      const { prefix = 'ez4', projectName, serveOptions } = await tryLoadProject(projectFile, workspacePath);

      const project = toKebabCase(`${prefix}-${projectName}`);

      const host = serveOptions?.localHost ?? 'localhost';
      const port = serveOptions?.localPort ?? 3734;

      const manifest = await fetchProjectManifest(project, host, port);

      projects.push({
        project,
        location: workspacePath,
        manifest
      });
    });

    await Promise.all(allOperations);

    projects.sort((a, b) => {
      if ((!a.manifest && !b.manifest) || (a.manifest && b.manifest)) {
        return a.project.localeCompare(b.project);
      } else if (a.manifest) {
        return -1;
      } else {
        return 1;
      }
    });

    return projects;
  };

  const fetchProjectManifest = async (project: string, host: string, port: number) => {
    const logger = LoggerService.get();

    try {
      logger.debug(`Fetch project manifest:`, project);

      const response = await fetch(`http://${host}:${port}/${project}/manifest`, {
        method: 'GET'
      });

      if (!response.ok) {
        logger.error(`Project ${project} unavailable:`, `status ${response.status}`);
      } else {
        const manifest = (await response.json()) as Record<string, ServiceManifest<ObjectSchema>>;

        return sortObject(manifest);
      }
    } catch (error) {
      logger.warn(`Project ${project} unavailable:`, error);
    }

    return undefined;
  };
}
