import type { ServiceManifest } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

import { basename, dirname } from 'node:path';
import { workspace } from 'vscode';

import { tryLoadProject } from '@ez4/project/library';
import { toKebabCase } from '@ez4/utils';

export type WorkspaceManifest = {
  manifest?: Record<string, ServiceManifest<ObjectSchema>>;
  project: string;
};

export namespace ManifestService {
  export const fetchAll = async () => {
    const files = await workspace.findFiles('**/ez4.project.js');

    const projects: WorkspaceManifest[] = [];

    const allOperations = files.map(async (file) => {
      const workspacePath = dirname(file.path);
      const projectFile = basename(file.path);

      const { prefix = 'ez4', projectName, serveOptions } = await tryLoadProject(projectFile, workspacePath);

      const project = toKebabCase(`${prefix}-${projectName}`);

      const host = serveOptions?.localHost ?? 'localhost';
      const port = serveOptions?.localPort ?? 3734;

      const manifest = await fetchProjectManifest(project, host, port);

      projects.push({
        project,
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
    try {
      const response = await fetch(`http://${host}:${port}/${project}/manifest`, {
        method: 'GET'
      });

      if (response.ok) {
        return (await response.json()) as Record<string, ServiceManifest<ObjectSchema>>;
      }
    } catch (error) {
      console.warn(error);
    }

    return undefined;
  };
}
