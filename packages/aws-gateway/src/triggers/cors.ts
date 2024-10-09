import { HttpCors, HttpRoute } from '@ez4/gateway/library';

export const getCorsConfiguration = (routes: HttpRoute[], cors: HttpCors) => {
  const allowHeaders = new Set<string>(cors.allowHeaders?.map((header) => header.toLowerCase()));
  const allowMethods = new Set<string>(cors.allowMethods);

  for (const route of routes) {
    if (!route.cors) {
      continue;
    }

    const [method] = route.path.split(' ', 2);

    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      allowHeaders.add('content-type');
    }

    getCorsHeaderNames(route).forEach((header) => {
      allowHeaders.add(header.toLowerCase());
    });

    allowMethods.add(method);
  }

  return {
    ...cors,
    allowHeaders: [...allowHeaders.values()],
    allowMethods: [...allowMethods.values()]
  };
};

const getCorsHeaderNames = (route: HttpRoute) => {
  const { authorizer, handler } = route;

  const headerNames = Object.keys({
    ...authorizer?.request?.headers?.properties,
    ...handler.request?.headers?.properties
  });

  return headerNames;
};
