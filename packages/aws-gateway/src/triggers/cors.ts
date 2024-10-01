import { HttpCors, HttpRoute } from '@ez4/gateway/library';

export const getCorsConfiguration = (routes: HttpRoute[], cors: HttpCors) => {
  const allowHeaders = new Set<string>(cors.allowHeaders?.map((header) => header.toLowerCase()));
  const allowMethods = new Set<string>(cors.allowMethods);

  for (const route of routes) {
    if (!route.cors) {
      continue;
    }

    const { path, authorizer, handler } = route;

    const [method] = path.split(' ', 2);

    const headers = Object.keys({
      ...authorizer?.request?.headers,
      ...handler.request?.headers
    });

    if (['POST', 'PATCH', 'PUT'].includes(method)) {
      allowHeaders.add('content-type');
    }

    headers.forEach((header) => {
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
