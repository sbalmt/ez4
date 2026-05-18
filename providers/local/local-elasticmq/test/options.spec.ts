import type { ServeOptions } from '@ez4/project/library';

import { equal, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LocalQueueOptionsNotFoundError, getElasticMqOptions } from '../src/provider/options';

const getBaseOptions = (overrides?: Partial<ServeOptions>): ServeOptions => {
  return {
    prefix: 'ez4',
    projectName: 'test',
    branchName: '',
    localOptions: {},
    testOptions: {},
    serviceHost: 'localhost',
    version: 1,
    ...overrides
  };
};

describe('elasticmq local options', () => {
  it('assert :: reads local queue options', () => {
    const options = getElasticMqOptions(
      getBaseOptions({
        localOptions: { queue: { host: 'localhost', port: 9324 } },
        test: false
      })
    );

    equal(options.endpoint, 'http://localhost:9324');
  });

  it('assert :: test options override local options', () => {
    const options = getElasticMqOptions(
      getBaseOptions({
        localOptions: { queue: { host: 'localhost', port: 9324 } },
        testOptions: { queue: { host: '127.0.0.1', port: 19324 } },
        test: true
      })
    );

    equal(options.endpoint, 'http://127.0.0.1:19324');
  });

  it('assert :: throws when queue options are missing', () => {
    throws(() => getElasticMqOptions(getBaseOptions({ test: false })), LocalQueueOptionsNotFoundError);
  });
});
