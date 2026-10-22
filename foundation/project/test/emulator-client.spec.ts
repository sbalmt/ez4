import type { EmulateServiceContext } from '../src/emulator/types';

import { equal, notEqual, ok, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tryCreateTrigger } from '@ez4/project/library';
import { isAnyObject } from '@ez4/utils';

import { loadServiceClient } from '../src/emulator/client';
import { getServiceEmulators } from '../src/emulator/service';
import { getServiceName } from '../src/utils/service';
import { Tester } from '../src/emulator/tester';
import { Runner } from '../src/emulator/runner';
import { emulators, options } from './common/emulator-clients';

describe('descriptor-based service clients', () => {
  it('assert :: emulator context loads fresh descriptor clients with custom options', async () => {
    let context: EmulateServiceContext | undefined;

    tryCreateTrigger('Test:descriptor-context-client', {
      'emulator:getServices': (event) => {
        if (event.options.projectName !== options.projectName || event.service.name !== 'Service') {
          return null;
        }

        const emulator = emulators[getServiceName(event.service.name, event.options)];

        if (!emulator) {
          return null;
        }

        context = event.context;

        return emulator;
      }
    });

    await getServiceEmulators(
      {
        service: {
          name: 'Service',
          type: '@service',
          context: {}
        }
      },
      {
        ...options,
        serviceHost: 'localhost',
        localOptions: {},
        testOptions: {}
      }
    );

    ok(context);

    const first = await context.makeService('Service', {
      value: 'context'
    });

    const second = await context.makeService('Service', {
      value: 'context'
    });

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.value, 'context');
    equal(second.value, 'context');

    notEqual(first.generation, second.generation);
    notEqual(first, second);
  });

  it('assert :: resolves dependencies loaded after the requested service', async () => {
    const first = await loadServiceClient(emulators, options, 'Dependent');
    const second = await loadServiceClient(emulators, options, 'Dependent');

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.dependency.value, 'dependency');
    notEqual(first.dependency, second.dependency);
    notEqual(first.dependency.generation, second.dependency.generation);

    equal(first.dependency.increment(), 1);
    equal(first.dependency.increment(), 2);
    equal(second.dependency.increment(), 1);
  });

  it('assert :: loads a fresh factory and client on each call', async () => {
    const first = await loadServiceClient(emulators, options, 'Service', {
      value: 'custom'
    });

    const second = await loadServiceClient(emulators, options, 'Service', {
      value: 'custom'
    });

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.value, 'custom');
    equal(second.value, 'custom');

    notEqual(first, second);
    notEqual(first.generation, second.generation);

    equal(first.increment(), 1);
    equal(first.increment(), 2);
    equal(second.increment(), 1);
  });

  it('assert :: tester isolates factory state across sequential requests', async () => {
    const first = await Tester.getServiceClient('Service');
    const second = await Tester.getServiceClient('Service');

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    notEqual(first, second);
    notEqual(first.generation, second.generation);

    equal(first.increment(), 1);
    equal(first.increment(), 2);
    equal(second.increment(), 1);
  });

  it('assert :: tester isolates factory state across concurrent requests', async () => {
    const [first, second] = await Promise.all([
      Tester.getServiceClient('Service', { value: 'tester' }),
      Tester.getServiceClient('Service', { value: 'tester' })
    ]);

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    notEqual(first, second);
    notEqual(first.generation, second.generation);

    equal(first.increment(), 1);
    equal(second.increment(), 1);
  });

  it('assert :: tester keeps per-call options isolated', async () => {
    const [first, second] = await Promise.all([
      Tester.getServiceClient('Service', { value: 'tester-first' }),
      Tester.getServiceClient('Service', { value: 'tester-second' })
    ]);

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.value, 'tester-first');
    equal(second.value, 'tester-second');
  });

  it('assert :: tester propagates errors without affecting other requests', async () => {
    const failing = Tester.getServiceClient('Service', { fail: true });
    const next = Tester.getServiceClient('Service', { value: 'tester-recovered' });

    await rejects(failing, /Service initialization failed/);
    const recovered = await next;

    ok(isAnyObject(recovered));

    equal(recovered.value, 'tester-recovered');
  });

  it('assert :: tester returns explicit mocks until restored', async () => {
    const client = { value: 'mock' };

    Tester.mockServiceClient('Service', client);

    try {
      equal(await Tester.getServiceClient('Service'), client);
      equal(await Tester.getServiceClient('Service'), client);
    } finally {
      Tester.restoreServiceClient('Service');
    }

    notEqual(await Tester.getServiceClient('Service'), client);
  });

  it('assert :: runner isolates factory state across sequential requests', async () => {
    const first = await Runner.getServiceClient('Service');
    const second = await Runner.getServiceClient('Service');

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    notEqual(first, second);
    notEqual(first.generation, second.generation);

    equal(first.increment(), 1);
    equal(first.increment(), 2);
    equal(second.increment(), 1);
  });

  it('assert :: runner isolates factory state across concurrent requests', async () => {
    const [first, second] = await Promise.all([
      Runner.getServiceClient('Service', { value: 'runner' }),
      Runner.getServiceClient('Service', { value: 'runner' })
    ]);

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    notEqual(first, second);
    notEqual(first.generation, second.generation);

    equal(first.increment(), 1);
    equal(second.increment(), 1);
  });

  it('assert :: runner keeps per-call options isolated', async () => {
    const [first, second] = await Promise.all([
      Runner.getServiceClient('Service', { value: 'runner-first' }),
      Runner.getServiceClient('Service', { value: 'runner-second' })
    ]);

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.value, 'runner-first');
    equal(second.value, 'runner-second');
  });

  it('assert :: runner propagates errors without affecting other requests', async () => {
    const failing = Runner.getServiceClient('Service', {
      fail: true
    });

    const next = Runner.getServiceClient('Service', {
      value: 'runner-recovered'
    });

    await rejects(failing, /Service initialization failed/);

    const recovered = await next;

    ok(isAnyObject(recovered));

    equal(recovered.value, 'runner-recovered');
  });
});
