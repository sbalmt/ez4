import type { MetadataReflection, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { ServerInstance } from '@ez4/server';

import { deepEqual, equal, match, rejects } from 'node:assert/strict';
import { after, before, describe, it, mock } from 'node:test';

import { buildMetadata, getServiceName, triggerAllAsync } from '@ez4/project/library';
import { notifyHttpRequest, providerRegistered, ProviderType, registerProvider, startServer, unregisterProvider } from '@ez4/server';
import { OpenApiGenerator } from '@ez4/docs-gateway/library';
import { HttpServiceType, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';

import { registerDocsProvider } from '../src/provider/local';
import { registerTriggers } from '../src/provider/register';

const options: ServeOptions = {
  prefix: 'test',
  projectName: 'docs-ui',
  branchName: 'dev',
  serviceHost: '127.0.0.1:3759',
  localOptions: {},
  testOptions: {}
};

const service: HttpService = {
  type: HttpServiceType,
  name: 'FirstGateway',
  context: {},
  variables: {},
  services: {},
  routes: []
};

const second: HttpService = {
  ...service,
  name: 'SecondGateway'
};

const firstIdentifier = getServiceName(service.name, options);
const secondIdentifier = getServiceName(second.name, options);

describe('gateway documentation provider', () => {
  let emulators: ServiceEmulator[];
  let server: ServerInstance;
  let gatewayMetadata: MetadataReflection;

  before(async () => {
    registerGatewayTriggers();
    gatewayMetadata = buildMetadata(['test/files/gateway.ts']).metadata;
    registerTriggers();

    emulators = [];

    for (const gateway of [service, second]) {
      const provider = await triggerAllAsync('emulator:getServices', (handler) => {
        return handler({
          service: gateway,
          options,
          context: {
            makeService: async () => undefined,
            makeReferences: () => ({}),
            makeDescriptors: () => ({})
          }
        });
      });

      if (!provider) {
        throw new Error('Documentation emulator was not registered.');
      }

      equal(provider.identifier, `${getServiceName(gateway.name, options)}/docs`);
      equal(provider.name, gateway.name);

      await provider.bootstrapHandler?.();

      emulators.push(provider);
    }

    server = await startServer({
      name: 'docs-provider-test',
      host: '127.0.0.1',
      port: 3759
    });
  });

  after(async () => {
    for (const emulator of emulators) {
      await emulator.shutdownHandler?.();
    }

    await server.close();
  });

  it('assert :: leaves existing gateway metadata unchanged for deployment', () => {
    const { metadata } = buildMetadata(['test/files/gateway.ts']);

    deepEqual(metadata, gatewayMetadata);
    equal(Object.values(metadata).filter((service) => service.type === HttpServiceType).length, 2);
  });

  it('assert :: serves documentation at each gateway docs path', async () => {
    for (const [identifier, name] of [
      [firstIdentifier, service.name],
      [secondIdentifier, second.name]
    ]) {
      const response = await fetch(`http://${options.serviceHost}/${identifier}/docs`);

      equal(response.status, 200);
      match(response.headers.get('content-type') ?? '', /text\/html/);

      const html = await response.text();

      match(html, new RegExp(`<title>${name} API</title>`));

      equal(html.includes(JSON.stringify({ url: `http://${options.serviceHost}/${identifier}` })), true);
      equal(html.includes(JSON.stringify({ url: `http://${options.serviceHost}/${identifier}/docs` })), false);
    }
  });

  it('assert :: returns 404 for unknown gateways, paths and methods', async () => {
    for (const [path, method] of [
      ['/docs/missing', 'GET'],
      ['/docs', 'GET'],
      [`/${firstIdentifier}/docs/extra`, 'GET'],
      [`/${firstIdentifier}/docs`, 'POST'],
      [`/docs/${firstIdentifier}`, 'GET']
    ]) {
      const response = await fetch(`http://${options.serviceHost}${path}`, { method });
      equal(response.status, 404);
      await response.text();
    }
  });

  it('assert :: keeps gateway requests separate from its documentation provider', async () => {
    registerProvider(firstIdentifier, {
      type: ProviderType.Http,
      requestHandler: ({ path }) => {
        return {
          status: 200,
          body: `gateway:${path}`
        };
      }
    });

    try {
      const api = await fetch(`http://${options.serviceHost}/${firstIdentifier}/items`);

      equal(await api.text(), 'gateway:/items');

      const docs = await fetch(`http://${options.serviceHost}/${firstIdentifier}/docs`);

      match(await docs.text(), /<title>FirstGateway API<\/title>/);
      equal(docs.status, 200);
    } finally {
      unregisterProvider(firstIdentifier);
    }
  });

  it('assert :: surfaces OpenAPI generation errors', async () => {
    const generator = mock.method(OpenApiGenerator, 'getGatewayOutput', () => {
      throw new Error('OpenAPI generation failed');
    });

    try {
      await rejects(notifyHttpRequest(`${firstIdentifier}/docs`, { method: 'GET', path: '/' }), /OpenAPI generation failed/);
    } finally {
      generator.mock.restore();
    }
  });

  it('assert :: removes old gateway documentation on reload and unregisters on shutdown', async () => {
    for (const emulator of emulators) {
      await emulator.shutdownHandler?.();
    }

    equal(providerRegistered(`${firstIdentifier}/docs`), false);
    equal(providerRegistered(`${secondIdentifier}/docs`), false);

    const emulator = registerDocsProvider(second, options);

    emulators = [emulator];

    await emulator.bootstrapHandler?.();

    const removed = await fetch(`http://${options.serviceHost}/${firstIdentifier}/docs`);

    equal(removed.status, 404);

    await removed.text();

    equal((await notifyHttpRequest(`${secondIdentifier}/docs`, { method: 'GET', path: '/' }))?.status, 200);
  });
});
