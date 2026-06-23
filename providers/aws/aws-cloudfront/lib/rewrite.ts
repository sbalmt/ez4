declare const __EZ4_REWRITE_RULES: {
  from: string;
  to: string;
  status?: 301 | 302;
}[];

function handler(event: any) {
  const request = event.request;

  const match = findRule(request.uri);

  if (!match) {
    return request;
  }

  const target = applyTarget(match.rule.to, match.capture);

  if (match.rule.status) {
    const location = buildRedirectLocation(request, target);

    return {
      statusCode: match.rule.status,
      statusDescription: match.rule.status === 301 ? 'Moved Permanently' : 'Found',
      headers: {
        location: {
          value: location
        }
      }
    };
  }

  request.uri = target;

  return request;
}

function findRule(uri: string) {
  for (let index = 0; index < __EZ4_REWRITE_RULES.length; index++) {
    const rule = __EZ4_REWRITE_RULES[index];

    const capture = matchRule(uri, rule.from);

    if (capture !== null) {
      return { rule, capture };
    }
  }

  return null;
}

function matchRule(uri: string, pattern: string) {
  const wildcardIndex = pattern.indexOf('*');

  if (wildcardIndex === -1) {
    return uri === pattern ? '' : null;
  }

  const prefix = pattern.substring(0, wildcardIndex);
  const suffix = pattern.substring(wildcardIndex + 1);

  if (!uri.startsWith(prefix)) {
    return null;
  }

  if (!suffix) {
    return uri.substring(prefix.length);
  }

  if (!uri.endsWith(suffix)) {
    return null;
  }

  return uri.substring(prefix.length, uri.length - suffix.length);
}

function applyTarget(target: string, capture: string) {
  const wildcardIndex = target.indexOf('*');

  if (wildcardIndex === -1) {
    return target;
  }

  return target.substring(0, wildcardIndex) + capture + target.substring(wildcardIndex + 1);
}

function buildRedirectLocation(request: any, target: string) {
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    const host = request.headers.host?.value ?? request.headers.host ?? '';

    target = 'https://' + host + target;
  }

  const query = serializeQueryString(request.querystring);

  if (query) {
    target = target + '?' + query;
  }

  return target;
}

function serializeQueryString(querystring: any) {
  const pairs: string[] = [];

  if (!querystring) {
    return '';
  }

  for (const key in querystring) {
    const value = querystring[key].value;

    if (value !== undefined) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    } else {
      pairs.push(encodeURIComponent(key));
    }
  }

  return pairs.join('&');
}
