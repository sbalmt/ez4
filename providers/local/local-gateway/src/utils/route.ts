import type { HttpHandler, HttpAuthorizer, HttpErrors, HttpPreferences } from '@ez4/gateway/library';
import type { EmulatorServiceRequest, LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type RouteData = {
  httpErrors?: HttpErrors | null;
  preferences?: HttpPreferences;
  variables?: LinkedVariables | null;
  authorizer?: HttpAuthorizer | null;
  listener?: ServiceListener | null;
  handler: HttpHandler;
};

export type MatchingRoute = RouteData & EmulatorServiceRequest & { parameters?: Record<string, string> };

export const getMatchingRoute = (routes: Record<string, RouteData>, request: EmulatorServiceRequest): MatchingRoute | undefined => {
  const sortedRoutes = Object.entries(routes).sort(([a], [b]) => {
    return b.length - a.length;
  });

  for (const [pattern, route] of sortedRoutes) {
    const matchedRoute = matchRoutePath(pattern, request.path);

    if (matchedRoute) {
      return {
        ...route,
        ...request,
        ...matchedRoute
      };
    }
  }

  return undefined;
};

const matchRoutePath = (pattern: string, path: string) => {
  const patternParts = pattern.split('/').filter((part) => !!part);
  const pathParts = path.split('/').filter((part) => !!part);

  const parameters: Record<string, string> = {};

  for (let index = 0; index < patternParts.length; index++) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith('{') && patternPart.endsWith('}')) {
      const parameterName = patternPart.slice(1, -1);

      // Allow AWS Gateway partial path.
      if (parameterName.toLowerCase() !== 'proxy+') {
        parameters[parameterName] = pathPart;
        continue;
      }

      break;
    }

    if (patternPart !== pathPart) {
      return undefined;
    }
  }

  return {
    parameters
  };
};
