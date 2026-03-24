import type { EmulatorServiceClients, EntrypointSource } from '@ez4/project/library';
import type { VirtualModule } from '../emulators/module';

import { ServiceEventType } from '@ez4/common';
import { Logger } from '@ez4/logger';

import { logErrorDetails } from './logger';

const getHeadline = (source: EntrypointSource) => {
  return `⤵️  ${source.file}:${source.position.join(':')} [${source.name}]`;
};

export const onBegin = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Begin`);

  return module.listener?.(
    {
      type: ServiceEventType.Begin,
      request
    },
    context
  );
};

export const onReady = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Ready`);

  return module.listener?.(
    {
      type: ServiceEventType.Ready,
      request
    },
    context
  );
};

export const onDone = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Done`);

  return module.listener?.(
    {
      type: ServiceEventType.Done,
      request
    },
    context
  );
};

export const onError = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown, error: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Error`);

  logErrorDetails(error);

  return module.listener?.(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    context
  );
};

export const onEnd = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} End`);

  return module.listener?.(
    {
      type: ServiceEventType.End,
      request
    },
    context
  );
};
