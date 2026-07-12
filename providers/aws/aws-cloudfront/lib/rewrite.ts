import type { CdnRewriteRule } from '@ez4/distribution/library';

declare const __EZ4_REWRITE_RULES: CdnRewriteRule[];

const HTTP_DESCRIPTIONS: Record<number, string> = {
  [301]: 'Moved Permanently',
  [302]: 'Found'
};

function handler(event: any) {
  const request = event.request;

  const match = findMatchingRule(request.uri);

  if (!match) {
    return request;
  }

  const target = applyTarget(match.rule.to, match.capture);

  if (match.rule.status || isRedirectTarget(target)) {
    const location = buildRedirectUri(request, target);
    const status = match.rule.status || 302;

    return {
      statusCode: status,
      statusDescription: HTTP_DESCRIPTIONS[status],
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

function findMatchingRule(uri: string) {
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

  const prefix = target.substring(0, wildcardIndex);
  const suffix = target.substring(wildcardIndex + 1);

  return `${prefix}${capture}${suffix}`;
}

function isRedirectTarget(target: string) {
  return target.startsWith('http://') || target.startsWith('https://');
}

function buildRedirectUri(request: any, target: string) {
  if (!isRedirectTarget(target)) {
    const host = request.headers.host?.value ?? request.headers.host ?? '';

    target = `https://${host}${target}`;
  }

  const query = request.querystring ? serializeQuery(request.querystring) : undefined;

  if (query) {
    target = target + '?' + query;
  }

  return target;
}

function serializeQuery(queryString: any) {
  const pairs: string[] = [];

  for (const key in queryString) {
    const value = queryString[key].value;

    if (value !== undefined) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    } else {
      pairs.push(encodeURIComponent(key));
    }
  }

  return pairs.join('&');
}
