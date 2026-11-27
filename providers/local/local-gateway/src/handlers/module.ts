import type { EmulateServiceContext, EmulatorLinkedServices, LinkedVariables, ServeOptions } from '@ez4/project/library';
import type { FunctionSignature, ServiceListener, ServiceMiddleware } from '@ez4/common/library';
import type { InvokerIncoming, InvokerOptions } from '../worker/invoker';

import { GatewayDefaults } from '@ez4/gateway/library';
import { createModule } from '@ez4/emulator';
import { arrayUnique } from '@ez4/utils';

export type GatewayModuleOptions = {
  handler: FunctionSignature;
  middlewares?: ServiceMiddleware[];
  listener?: ServiceListener;
  services?: EmulatorLinkedServices;
  variables?: LinkedVariables | undefined;
  invoker: InvokerOptions;
  timeout?: number;
  memory?: number;
};

export const invokeGatewayModule = <T>(
  options: ServeOptions,
  context: EmulateServiceContext,
  module: GatewayModuleOptions,
  request: InvokerIncoming
) => {
  const { handler, middlewares = [], listener, services = {}, variables, invoker, timeout, memory } = module;

  const references = handler.references
    ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
    : undefined;

  const instance = createModule<T>({
    services: context.makeDescriptors(services),
    references: context.makeReferences(services, references),
    workspacePath: options.workspacePath,
    handler,
    middlewares,
    listener,
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-gateway/worker',
      options: invoker
    },
    environment: {
      memory: memory ?? GatewayDefaults.Memory,
      timeout: timeout ?? GatewayDefaults.Timeout,
      variables: {
        ...options.variables,
        ...variables
      }
    }
  });

  return instance.invoke(request);
};
