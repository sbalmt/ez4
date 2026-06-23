import { deepEqual, equal } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import vm from 'node:vm';

import { transform } from 'esbuild';

const templatePath = './lib/rewrite.ts';

const invokeRewrite = async (rules: object[], request: object): Promise<any> => {
  const source = await readFile(templatePath, 'utf8');

  const result = await transform(source, {
    loader: 'ts',
    define: {
      __EZ4_REWRITE_RULES: JSON.stringify(rules)
    }
  });

  return vm.runInNewContext(`${result.code}; handler(${JSON.stringify({ request })});`);
};

describe('cloudfront :: rewrite function', () => {
  it('assert :: absolute 301 redirect preserves query string', async () => {
    const response = await invokeRewrite(
      [
        {
          from: '/blog/*',
          to: 'https://blog.example.com/*',
          status: 301
        }
      ],
      {
        uri: '/blog/post-1',
        headers: {
          host: {
            value: 'www.example.com'
          }
        },
        querystring: {
          utm: {
            value: '1'
          }
        }
      }
    );

    equal(response.statusCode, 301);
    equal(response.statusDescription, 'Moved Permanently');
    equal(response.headers.location.value, 'https://blog.example.com/post-1?utm=1');
  });

  it('assert :: relative 302 redirect uses current host', async () => {
    const response = await invokeRewrite(
      [
        {
          from: '/old/path',
          to: '/new/path',
          status: 302
        }
      ],
      {
        uri: '/old/path',
        headers: {
          host: {
            value: 'www.example.com'
          }
        }
      }
    );

    equal(response.statusCode, 302);
    equal(response.statusDescription, 'Found');
    equal(response.headers.location.value, 'https://www.example.com/new/path');
  });

  it('assert :: redirect without query omits the query marker', async () => {
    const response = await invokeRewrite(
      [
        {
          from: '/old/path',
          to: '/new/path',
          status: 301
        }
      ],
      {
        uri: '/old/path',
        headers: {
          host: {
            value: 'www.example.com'
          }
        },
        // CloudFront Functions provide an empty object when there is no query.
        querystring: {}
      }
    );

    equal(response.statusCode, 301);
    equal(response.headers.location.value, 'https://www.example.com/new/path');
  });

  it('assert :: internal rewrite changes request uri', async () => {
    const request = {
      uri: '/app/dashboard',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    };

    const result = await invokeRewrite(
      [
        {
          from: '/app/*',
          to: '/index.html'
        }
      ],
      request
    );

    equal(result.uri, '/index.html');
  });

  it('assert :: rule order is preserved across redirects and rewrites', async () => {
    const response = await invokeRewrite(
      [
        {
          from: '/same/*',
          to: '/internal/*'
        },
        {
          from: '/same/*',
          to: '/external/*',
          status: 301
        }
      ],
      {
        uri: '/same/path',
        headers: {
          host: {
            value: 'www.example.com'
          }
        }
      }
    );

    // The first matching rule wins, even though a later rule is a redirect.
    equal(response.statusCode, undefined);
    equal(response.uri, '/internal/path');
  });

  it('assert :: unmatched uri returns original request', async () => {
    const request = {
      uri: '/unknown/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    };

    const result = await invokeRewrite(
      [
        {
          from: '/app/*',
          to: '/index.html'
        }
      ],
      request
    );

    equal(result.uri, '/unknown/path');
    equal(result.statusCode, undefined);
  });
});
