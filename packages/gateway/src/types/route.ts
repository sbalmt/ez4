import type { LinkedVariables } from '@ez4/project/library';
import type { HttpAuthorizer } from './authorizer.js';
import type { HttpHandler } from './handler.js';
import type { HttpPath } from './path.js';

export type HttpRoute = {
  path: HttpPath;
  handler: HttpHandler;
  authorizer?: HttpAuthorizer;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};
