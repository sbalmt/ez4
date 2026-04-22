import type { EntrypointFunction, EntrypointSource, LinkedVariables } from '@ez4/project/library';

import { createEmulatorModule } from '@ez4/project/library';

export type VirtualModule = {
  source: EntrypointSource;
  listener?: EntrypointFunction;
  handler: EntrypointFunction;
};

export type ModuleDefinition = {
  listener?: EntrypointSource | null;
  handler: EntrypointSource;
  variables: LinkedVariables;
  version: number;
};

export const createModule = async (module: ModuleDefinition): Promise<VirtualModule> => {
  const { handler, listener, variables, version } = module;

  const [listenerModule, handlerModule] = await Promise.all([
    listener &&
      createEmulatorModule({
        entrypoint: listener,
        variables,
        version
      }),
    createEmulatorModule({
      entrypoint: handler,
      variables,
      version
    })
  ]);

  return {
    handler: handlerModule.invoke,
    listener: listenerModule?.invoke,
    source: handler
  };
};
