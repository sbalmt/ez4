import type { ServiceEmulator } from '../src/emulator/types';
import type { ServeOptions } from '../src/types/options';

import { deepEqual, equal } from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { notifyHttpRequest, unregisterProvider } from '@ez4/server';

import { getServicesManifest, registerManifestProvider } from '../src/manifest/service';

const PROJECT_NAME = 'sample';

const options: ServeOptions = {
  prefix: 'ez4',
  projectName: 'sample',
  branchName: 'dev',
  localOptions: {},
  testOptions: {},
  serviceHost: 'localhost:3734',
  version: 1
};

const emulators: Record<string, ServiceEmulator> = {
  'ez4-sample-dev-api': {
    type: 'Gateway',
    name: 'Api',
    identifier: 'ez4-sample-dev-api',
    manifestHandler: () => ({
      actions: []
    })
  }
};

describe('project manifest provider', () => {
  afterEach(() => {
    unregisterProvider(PROJECT_NAME);
  });

  it('serves the current project manifest from the project provider path', async () => {
    registerManifestProvider(PROJECT_NAME, () => getServicesManifest(emulators, options));

    const response = await notifyHttpRequest(PROJECT_NAME, {
      method: 'GET',
      path: '/manifest'
    });

    equal(response?.status, 200);
    equal(response?.headers?.['Content-Type'], 'application/json');
    equal(typeof response?.body, 'string');
    deepEqual(JSON.parse(String(response?.body)), {
      identifier: 'ez4-sample-dev',
      host: 'localhost:3734',
      settings: {
        prefix: 'ez4',
        name: 'sample',
        branch: 'dev'
      },
      services: {
        api: {
          path: '/ez4-sample-dev-api',
          type: 'Gateway',
          actions: []
        }
      }
    });
  });

  it('returns 404 when the global provider receives another route or method', async () => {
    registerManifestProvider(PROJECT_NAME, () => getServicesManifest(emulators, options));

    const routeResponse = await notifyHttpRequest(PROJECT_NAME, {
      method: 'GET',
      path: '/unknown'
    });
    const methodResponse = await notifyHttpRequest(PROJECT_NAME, {
      method: 'POST',
      path: '/manifest'
    });

    equal(routeResponse?.status, 404);
    equal(methodResponse?.status, 404);
  });
});
