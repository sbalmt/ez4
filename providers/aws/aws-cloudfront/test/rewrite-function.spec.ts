import { deepEqual, equal } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { describe, it } from 'node:test';

import { transform } from 'esbuild';

const templatePath = './lib/rewrite.ts';

const invokeRewrite = async (rules: object[], request: object): Promise<any> => {
  const source = await readFile(templatePath, 'utf8');

  const { code } = await transform(source, {
    loader: 'ts',
    define: {
      __EZ4_REWRITE_RULES: JSON.stringify(rules)
    }
  });

  const output = runInNewContext(`${code}; handler(${JSON.stringify({ request })});`);

  // Normalize object prototype created in the new context
  return JSON.parse(JSON.stringify(output));
};

describe('cloudfront :: rewrite function', () => {
  it('assert :: redirect preserving query string (absolute 301)', async () => {
    const rules = [
      {
        from: '/path/*',
        to: 'https://another.example.com/*',
        status: 301
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/directory-1',
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
    });

    deepEqual(response, {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: 'https://another.example.com/directory-1?utm=1'
        }
      }
    });
  });

  it('assert :: redirect using current host (relative 302)', async () => {
    const rules = [
      {
        from: '/old/path',
        to: '/new/path',
        status: 302
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/old/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });

    deepEqual(response, {
      statusCode: 302,
      statusDescription: 'Found',
      headers: {
        location: {
          value: 'https://www.example.com/new/path'
        }
      }
    });
  });

  it('assert :: redirect without query omits the query marker', async () => {
    const rules = [
      {
        from: '/old/path',
        to: '/new/path',
        status: 301
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/old/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      },
      // CloudFront Functions provide an empty object when there is no query.
      querystring: {}
    });

    deepEqual(response, {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: 'https://www.example.com/new/path'
        }
      }
    });
  });

  it('assert :: redirect without explicit status uses 302', async () => {
    const rules = [
      {
        from: '/old/*',
        to: 'https://another.example.com/new/*'
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/old/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });

    deepEqual(response, {
      statusCode: 302,
      statusDescription: 'Found',
      headers: {
        location: {
          value: 'https://another.example.com/new/path'
        }
      }
    });
  });

  it('assert :: internal rewrite changes request uri', async () => {
    const rules = [
      {
        from: '/path/*',
        to: '/index.html'
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/location',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });

    deepEqual(response, {
      uri: '/index.html',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });
  });

  it('assert :: internal rewrite changes request uri (with negation)', async () => {
    const rules = [
      {
        from: '!*.css',
        to: '/index.html',
        negation: true
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/location',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });

    deepEqual(response, {
      uri: '/index.html',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });
  });

  it('assert :: order is preserved across redirects and rewrites', async () => {
    const rules = [
      {
        from: '/same/*',
        to: '/internal/*'
      },
      {
        from: '/same/*',
        to: '/external/*',
        status: 301
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/same/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    });

    // The first matching rule wins, even though a later rule is a redirect.
    equal(response.statusCode, undefined);
    equal(response.uri, '/internal/path');
  });

  it('assert :: unmatched uri returns original request', async () => {
    const rules = [
      {
        from: '/path/*',
        to: '/index.html'
      }
    ];

    const request = {
      uri: '/unknown/path',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    };

    const result = await invokeRewrite(rules, request);

    equal(result.uri, '/unknown/path');
    equal(result.statusCode, undefined);
  });

  it('assert :: unmatched uri returns original request (with negation)', async () => {
    const rules = [
      {
        from: '/path/*.css',
        to: '/index.html',
        negation: true
      }
    ];

    const request = {
      uri: '/path/file.css',
      headers: {
        host: {
          value: 'www.example.com'
        }
      }
    };

    const result = await invokeRewrite(rules, request);

    equal(result.uri, '/path/file.css');
    equal(result.statusCode, undefined);
  });
});
