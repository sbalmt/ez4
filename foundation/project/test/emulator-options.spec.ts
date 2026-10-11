import type { EmulatorServiceDescriptor, ServiceEmulator } from '../src/emulator/types';

import { deepEqual, equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { tryCreateTrigger } from '@ez4/project/library';

import { getServiceEmulators, makeServiceDescriptors } from '../src/emulator/service';
import { getServiceName } from '../src/utils/service';

describe('project emulator options', async () => {
  let descriptors: Record<string, EmulatorServiceDescriptor> | undefined;

  tryCreateTrigger('Test:emulator-options-inheritance', {
    'emulator:getServices': (event) => {
      const { service, options, context } = event;

      if (options.projectName !== 'emulator' || !['Options', 'Service', 'Handler'].includes(service.name)) {
        return null;
      }

      const emulator: ServiceEmulator = {
        type: service.type,
        name: service.name,
        identifier: getServiceName(service.name, options),
        options: service.options
      };

      if (service.name === 'Options') {
        return {
          ...emulator,
          inheritOptions: true,
          exportDescriptor: (options) => ({
            name: 'makeOptions',
            module: 'test',
            options
          })
        };
      }

      if (service.name === 'Service') {
        const dependencies = service.services ?? {};

        return {
          ...emulator,
          exportDescriptor: (options) => {
            return {
              name: 'makeService',
              module: 'test',
              dependencies,
              options: {
                references: context.makeReferences(dependencies, undefined, options)
              }
            };
          }
        };
      }

      if (service.name === 'Handler') {
        descriptors = context.makeDescriptors(service.services ?? {});
      }

      return emulator;
    }
  });

  await getServiceEmulators(
    {
      options: {
        type: '@options',
        name: 'Options',
        context: {}
      },
      service: {
        type: '@service',
        name: 'Service',
        context: {},
        options: {
          level: 0,
          defaultValue: 'contract'
        },
        services: {
          options: {
            reference: 'Options'
          },
          serviceB: {
            reference: 'Service',
            options: {
              level: 2
            }
          }
        }
      },
      handler: {
        type: '@handler',
        name: 'Handler',
        context: {},
        services: {
          serviceA: {
            reference: 'Service',
            options: {
              level: 1
            }
          }
        }
      }
    },
    {
      prefix: 'test',
      projectName: 'emulator',
      serviceHost: 'localhost',
      branchName: '',
      localOptions: {},
      testOptions: {},
      version: 1
    }
  );

  ok(descriptors);

  const descriptorsList = Object.values(descriptors);
  const descriptorsName = Object.keys(descriptors);

  it('assert :: contract defaults are injected when linked options are absent', () => {
    const options = {
      prefix: 'test',
      projectName: 'defaults',
      branchName: ''
    };

    const defaults = {
      defaultValue: 'contract',
      level: 0
    };

    const identifier = getServiceName('Service', options);

    const result = makeServiceDescriptors(
      {
        service: {
          reference: 'Service'
        }
      },
      {
        [identifier]: {
          identifier,
          type: '@service',
          name: 'Service',
          options: defaults,
          exportDescriptor: (options) => ({
            name: 'makeService',
            module: 'test',
            options
          })
        }
      },
      options
    );

    deepEqual(Object.values(result)[0].options, defaults);

    deepEqual(defaults, {
      level: 0,
      defaultValue: 'contract'
    });
  });

  it('assert :: injected serviceA options are propagated to its options', async () => {
    const service1Descriptor = descriptorsList.find(({ name }) => name === 'makeService');
    const options1Descriptor = descriptorsList.find(({ name }) => name === 'makeOptions');
    const options1Identifier = descriptorsName.find((name) => descriptors?.[name] === options1Descriptor);

    ok(service1Descriptor);
    ok(options1Descriptor);

    equal(service1Descriptor.options?.references.options, options1Identifier);

    deepEqual(options1Descriptor.options, {
      level: 1,
      defaultValue: 'contract'
    });
  });

  it('assert :: injected serviceB options are propagated to its options', async () => {
    const service2Descriptor = descriptorsList.findLast(({ name }) => name === 'makeService');
    const options2Descriptor = descriptorsList.findLast(({ name }) => name === 'makeOptions');
    const options2Identifier = descriptorsName.findLast((name) => descriptors?.[name] === options2Descriptor);

    ok(service2Descriptor);
    ok(options2Descriptor);

    equal(service2Descriptor.options?.references.options, options2Identifier);

    deepEqual(options2Descriptor.options, {
      level: 2,
      defaultValue: 'contract'
    });
  });
});
