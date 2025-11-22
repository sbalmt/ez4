import type { ProjectOptions } from '../types/project';
import type { ServeOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getServeOptions = (project: ProjectOptions): ServeOptions => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  return {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    serviceHost: `${serviceHost}:${servicePort}`,
    localOptions: project.localOptions ?? {},
    variables: project.variables,
    force: project.debugMode,
    debug: project.debugMode,
    reset: project.resetMode,
    local: project.localMode,
    version: 0
  };
};
