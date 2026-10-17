import type { EmulateServiceContext, EmulatorLinkedServices, LinkedVariables, ServeOptions } from '@ez4/project/library';
import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { InvokerIncoming, InvokerOptions } from '../worker/invoker';

import { createModule } from '@ez4/emulator';

export type GatewayModuleOptions = {
  handler: FunctionSignature;
  listener?: ServiceListener | null;
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
  const { handler, listener, services = {}, variables, invoker, timeout, memory } = module;

  const instance = createModule<T>({
    handler,
    listener: listener ?? undefined,
    references: context.makeReferences(services, handler.references),
    services: context.makeDescriptors(services),
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-gateway/worker',
      options: invoker
    },
    environment: {
      memory: memory ?? 192,
      timeout: timeout ?? 30,
      variables: {
        ...options.variables,
        ...variables
      }
    }
  });

  return instance.invoke(request);
};
