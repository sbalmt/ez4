import type { ServiceEmulators } from '../../src/emulator/service';

import { makeServiceReferences } from '../../src/emulator/service';
import { getServiceName } from '../../src/utils/service';
import { Tester } from '../../src/emulator/tester';
import { Runner } from '../../src/emulator/runner';

export const options = {
  prefix: 'test',
  projectName: 'clients',
  branchName: '',
  variables: {
    EZ4_CLIENT_PROJECT: 'project',
    EZ4_CLIENT_VALUE: 'project-value'
  }
};

const dependencies = {
  dependency: {
    reference: 'Service',
    options: {
      value: 'dependency'
    }
  }
};

export const emulators: ServiceEmulators = {
  [getServiceName('Service', options)]: {
    identifier: getServiceName('Service', options),
    name: 'Service',
    type: '@service',
    exportDescriptor: (options) => ({
      file: 'test/files/service-client.ts',
      name: 'makeServiceClient',
      options
    })
  },
  [getServiceName('Dependent', options)]: {
    type: '@service',
    name: 'Dependent',
    identifier: getServiceName('Dependent', options),
    exportDescriptor: () => ({
      file: 'test/files/service-client.ts',
      name: 'makeDependentService',
      dependencies,
      options: {
        references: makeServiceReferences(dependencies, emulators, options)
      }
    })
  },
  [getServiceName('Environment', options)]: {
    type: '@service',
    name: 'Environment',
    identifier: getServiceName('Environment', options),
    exportDescriptor: (options) => ({
      file: 'test/files/service-client.ts',
      name: 'makeEnvironmentService',
      variables: {
        EZ4_CLIENT_VALUE: options?.value ?? 'service'
      }
    })
  },
  [getServiceName('NestedEnvironment', options)]: {
    type: '@service',
    name: 'NestedEnvironment',
    identifier: getServiceName('NestedEnvironment', options),
    exportDescriptor: () => ({
      file: 'test/files/service-client.ts',
      name: 'makeEnvironmentService',
      dependencies: {
        child: {
          reference: 'Environment'
        },
        self: {
          reference: 'NestedEnvironment'
        }
      },
      variables: {
        EZ4_CLIENT_NESTED: 'nested',
        EZ4_CLIENT_VALUE: 'service'
      }
    })
  },
  [getServiceName('ConflictingEnvironment', options)]: {
    type: '@service',
    name: 'ConflictingEnvironment',
    identifier: getServiceName('ConflictingEnvironment', options),
    exportDescriptor: () => ({
      file: 'test/files/service-client.ts',
      name: 'makeEnvironmentService',
      dependencies: {
        child: {
          reference: 'Environment'
        }
      },
      variables: {
        EZ4_CLIENT_VALUE: 'conflicting'
      }
    })
  }
};

Tester.configure(emulators, options);
Runner.configure(emulators, options);
