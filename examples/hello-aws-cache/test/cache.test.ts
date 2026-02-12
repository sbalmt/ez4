import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { CacheTester } from '@ez4/local-cache/test';
import { setDataHandler } from '../src/endpoints/set';
import { getDataHandler } from '../src/endpoints/get';

describe('hello aws cache', () => {
  const cacheService = CacheTester.getClient('CacheService');

  it('set cache data', async () => {
    const response = await setDataHandler(
      {
        body: {
          key: 'test',
          value: 'foo-bar'
        }
      },
      {
        cacheService
      }
    );

    deepEqual(response, {
      status: 204
    });
  });

  it('get cache data', async () => {
    const response = await getDataHandler(
      {
        parameters: {
          key: 'test'
        }
      },
      {
        cacheService
      }
    );

    deepEqual(response, {
      status: 200,
      body: {
        value: 'foo-bar'
      }
    });
  });
});
