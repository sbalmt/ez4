import type { EmulateServiceContext } from '../src/emulator/types';

import { deepEqual, equal, ok, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tryCreateTrigger } from '@ez4/project/library';
import { isAnyObject } from '@ez4/utils';

import { loadServiceClient } from '../src/emulator/client';
import { getServiceEmulators } from '../src/emulator/service';
import { getServiceName } from '../src/utils/service';
import { Tester } from '../src/emulator/tester';
import { Runner } from '../src/emulator/runner';
import { emulators, options } from './common/emulator-clients';

describe('project emulator variables', () => {
  it('assert :: emulator context uses the effective client environment', async () => {
    let context: EmulateServiceContext | undefined;

    tryCreateTrigger('Test:descriptor-context-variables', {
      'emulator:getServices': (event) => {
        if (event.options.projectName !== options.projectName) {
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
        environment: {
          name: 'Environment',
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

    const client = await context.makeService('Environment');

    ok(isAnyObject(client));

    equal(client.readVariable('EZ4_CLIENT_PROJECT'), 'project');
    equal(client.readVariable('EZ4_CLIENT_VALUE'), 'service');
  });

  it('assert :: merges process, project and nested service variables without changing process.env', async () => {
    const environment = { ...process.env };

    const client = await loadServiceClient(emulators, options, 'NestedEnvironment');

    ok(isAnyObject(client));

    equal(client.readVariable('EZ4_CLIENT_PROJECT'), 'project');
    equal(client.readVariable('EZ4_CLIENT_VALUE'), 'service');
    equal(client.readVariable('EZ4_CLIENT_NESTED'), 'nested');

    for (const name of Object.keys(environment)) {
      if (!(name in options.variables) && name !== 'EZ4_CLIENT_NESTED') {
        equal(client.readVariable(name), environment[name]);
      }
    }

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: project variables override process values and are snapshotted', async () => {
    const environment = { ...process.env };

    const variables = {
      ...options.variables,
      PATH: 'client-project-path'
    };

    const client = await loadServiceClient(emulators, { ...options, variables }, 'Environment');

    variables.PATH = 'changed-project-path';

    ok(isAnyObject(client));

    equal(client.readVariable('PATH'), 'client-project-path');

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: keeps concurrent client environments and later reads isolated', async () => {
    const environment = { ...process.env };

    const [first, second] = await Promise.all([
      Tester.getServiceClient('Environment', { value: 'first' }),
      Tester.getServiceClient('Environment', { value: 'second' })
    ]);

    ok(isAnyObject(first));
    ok(isAnyObject(second));

    equal(first.readVariable('EZ4_CLIENT_VALUE'), 'first');
    equal(first.readVariable('EZ4_CLIENT_PROJECT'), 'project');

    equal(second.readVariable('EZ4_CLIENT_VALUE'), 'second');
    equal(second.readVariable('EZ4_CLIENT_PROJECT'), 'project');

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: runner uses the effective client environment', async () => {
    const client = await Runner.getServiceClient('Environment');

    ok(isAnyObject(client));

    equal(client.readVariable('EZ4_CLIENT_VALUE'), 'service');
    equal(client.readVariable('EZ4_CLIENT_PROJECT'), 'project');
  });

  it('assert :: rejects conflicting service variables without affecting later clients', async () => {
    const environment = { ...process.env };

    await rejects(
      Tester.getServiceClient('ConflictingEnvironment'),
      /Variable EZ4_CLIENT_VALUE for service ConflictingEnvironment is duplicate/
    );

    const client = await Tester.getServiceClient('Environment');

    ok(isAnyObject(client));

    equal(client.readVariable('EZ4_CLIENT_VALUE'), 'service');

    deepEqual({ ...process.env }, environment);
  });
});
