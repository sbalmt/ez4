import { HttpCors, HttpRoute } from '@ez4/gateway/library';

export const getCorsConfiguration = (routes: HttpRoute[], cors: HttpCors): HttpCors => {
  const allowHeaders = new Set<string>(cors.allowHeaders?.map((header) => header.toLowerCase()));
  const allowMethods = new Set<string>(cors.allowMethods);

  for (const route of routes) {
    if (!route.cors) {
      continue;
    }

    const [method] = route.path.split(' ', 2);

    allowMethods.add(method);

    getCorsHeaderNames(route).forEach((header) => {
      allowHeaders.add(header.toLowerCase());
    });
  }

  const allowCredentials = cors.allowCredentials ?? allowHeaders.has('authorization');

  if (['POST', 'PATCH', 'PUT'].some((method) => allowMethods.has(method))) {
    allowHeaders.add('content-type');
  }

  return {
    ...cors,
    allowCredentials,
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
