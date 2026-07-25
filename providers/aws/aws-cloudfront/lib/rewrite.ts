import type { CdnRewriteRule } from '@ez4/distribution/library';
import type { AnyObject } from '@ez4/utils';

declare const __EZ4_REWRITE_RULES: CdnRewriteRule[];

const HTTP_DESCRIPTIONS: Record<number, string> = {
  [301]: 'Moved Permanently',
  [302]: 'Found'
};

function handler(event: any) {
  const request = event.request;

  const match = matchRewriteRule(request.uri);

  if (!match) {
    return request;
  }

  const target = applyTargetVariables(match.rule.to, match.variables);

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

function matchRewriteRule(uri: string) {
  for (let index = 0; index < __EZ4_REWRITE_RULES.length; index++) {
    const rule = __EZ4_REWRITE_RULES[index];

    const variables = new RegExp(rule.from).exec(uri);

    if (variables !== null) {
      return {
        rule,
        variables
      };
    }
  }

  return null;
}

function applyTargetVariables(target: string, variables: string[]) {
  return target.replaceAll(/\$([0-1]+)/g, (_, index) => variables[Number(index)]);
}

function isRedirectTarget(target: string) {
  return target.startsWith('http://') || target.startsWith('https://');
}

function buildRedirectUri(request: AnyObject, target: string) {
  if (!isRedirectTarget(target)) {
    const host = request.headers.host?.value ?? request.headers.host ?? '';

    target = `https://${host}${target}`;
  }

  const query = request.querystring ? buildQueryString(request.querystring) : undefined;

  if (query) {
    return `${target}?${query}`;
  }

  return target;
}

function buildQueryString(queryString: AnyObject) {
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
