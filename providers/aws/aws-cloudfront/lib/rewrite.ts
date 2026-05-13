declare const __EZ4_REWRITE_PATHS: Record<string, string>;

function handler(event: any) {
  const request = event.request;
  const uri = request.uri;

  for (var path in __EZ4_REWRITE_PATHS) {
    const location = __EZ4_REWRITE_PATHS[path];
    const parts = path.split('*', 2);

    const prefix = parts[0];
    const suffix = parts[1];

    if (uri.startsWith(prefix) && (!suffix || uri.endsWith(suffix))) {
      request.uri = location;
      break;
    }
  }

  return request;
}
