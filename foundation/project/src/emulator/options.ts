import type { ProjectOptions } from '../types/project';
import type { InputOptions } from '../terminal/options';
import type { ServeOptions } from '../types/options';

import { toKebabCase } from '@ez4/utils';

export const getServeOptions = (input: InputOptions, project: ProjectOptions): ServeOptions => {
  const serveOptions = project.serveOptions;

  const serviceHost = serveOptions?.localHost ?? 'localhost';
  const servicePort = serveOptions?.localPort ?? 3734;

  return {
    resourcePrefix: project.prefix ?? 'ez4',
    projectName: toKebabCase(project.projectName),
    serviceHost: `${serviceHost}:${servicePort}`,
    localOptions: project.localOptions ?? {},
    testOptions: project.testOptions ?? {},
    debug: input.debug ?? project.debugMode,
    reset: input.reset ?? project.resetMode,
    local: input.local ?? project.localMode,
    variables: project.variables,
    suppress: input.suppress,
    version: 0
  };
};
