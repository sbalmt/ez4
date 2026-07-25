import { deepEqual, equal } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { describe, it } from 'node:test';

import { transform } from 'esbuild';

import { compileRewritePattern } from '@ez4/distribution/library';

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
  it('assert :: redirect preserving query string (status 301)', async () => {
    const rules = [
      {
        from: compileRewritePattern('/path/*'),
        to: 'https://another.example.com/$1',
        status: 301
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/page',
      headers: {
        host: {
          value: 'www.example.com'
        }
      },
      querystring: {
        parameter: {
          value: '1'
        }
      }
    });

    deepEqual(response, {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: 'https://another.example.com/page?parameter=1'
        }
      }
    });
  });

  it('assert :: redirect using current host (status 302)', async () => {
    const rules = [
      {
        from: compileRewritePattern('/old/path/*'),
        to: '/new/path/$1',
        status: 302
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/old/path/page',
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
          value: 'https://www.example.com/new/path/page'
        }
      }
    });
  });

  it('assert :: redirect without defined status (fallback to status 302)', async () => {
    const rules = [
      {
        from: compileRewritePattern('/old/*'),
        to: 'https://another.example.com/new/$1'
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

  it('assert :: redirect without query string (omit query marker)', async () => {
    const rules = [
      {
        from: compileRewritePattern('/old/path'),
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

  it('assert :: internal rewrite changes request uri', async () => {
    const rules = [
      {
        from: compileRewritePattern('/path/*'),
        to: '/index.html'
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/page',
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
        from: compileRewritePattern('/path/!*.{css|html}'),
        to: '/index.html'
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/path/page',
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
        from: compileRewritePattern('/same/*'),
        to: '/internal/$1'
      },
      {
        from: compileRewritePattern('/same/*'),
        to: '/external/$1',
        status: 301
      }
    ];

    const response = await invokeRewrite(rules, {
      uri: '/same/path'
    });

    // The first matching rule wins, even though a later rule is a redirect.
    equal(response.statusCode, undefined);
    equal(response.uri, '/internal/path');
  });

  it('assert :: unmatched uri returns original request', async () => {
    const rules = [
      {
        from: compileRewritePattern('/path/*'),
        to: '/index.html'
      }
    ];

    const result = await invokeRewrite(rules, {
      uri: '/unknown/path'
    });

    equal(result.uri, '/unknown/path');
    equal(result.statusCode, undefined);
  });

  it('assert :: unmatched uri returns original request (with negation)', async () => {
    const rules = [
      {
        from: compileRewritePattern('/path/!*.{png|css}'),
        to: '/index.html'
      }
    ];

    const responseA = await invokeRewrite(rules, {
      uri: '/path/file-1.css'
    });

    equal(responseA.uri, '/path/file-1.css');
    equal(responseA.statusCode, undefined);

    const responseB = await invokeRewrite(rules, {
      uri: '/path/file-2.png'
    });

    equal(responseB.uri, '/path/file-2.png');
    equal(responseB.statusCode, undefined);
  });
});
