import type { LinkedVariables } from '@ez4/project';
import type { HttpHandler } from './handler.js';
import type { HttpPath } from './path.js';

export type HttpRoute = {
  path: HttpPath;
  handler: HttpHandler;
  variables?: LinkedVariables | null;
};
