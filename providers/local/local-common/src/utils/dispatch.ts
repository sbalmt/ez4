import type { EmulatorServiceClients, EntrypointSource } from '@ez4/project/library';
import type { VirtualModule } from '../emulators/module';

import { ServiceEventType } from '@ez4/common';
import { Logger } from '@ez4/logger';

import { logErrorDetails } from './logger';

const getHeadline = (source: EntrypointSource) => {
  return `⤵️  ${source.file}:${source.position.join(':')} [${source.name}]`;
};

const dispatch = async (module: VirtualModule, context: EmulatorServiceClients | null | undefined, event: any) => {
  try {
    await module.listener?.(event, context);
  } catch (error) {
    if (event.type === ServiceEventType.Begin || event.type === ServiceEventType.Ready) {
      throw error;
    }

    logErrorDetails(error);
  }
};

export const onBegin = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Begin`);

  return dispatch(module, context, {
    type: ServiceEventType.Begin,
    request
  });
};

export const onReady = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Ready`);

  return dispatch(module, context, {
    type: ServiceEventType.Ready,
    request
  });
};

export const onDone = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Done`);

  return dispatch(module, context, {
    type: ServiceEventType.Done,
    request
  });
};

export const onTimeout = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Timeout`);

  return dispatch(module, context, {
    type: ServiceEventType.Timeout,
    request
  });
};

export const onError = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown, error: unknown) => {
  Logger.debug(`${getHeadline(module.source)} Error`);

  logErrorDetails(error);

  return dispatch(module, context, {
    type: ServiceEventType.Error,
    request,
    error
  });
};

export const onEnd = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  Logger.debug(`${getHeadline(module.source)} End`);

  return dispatch(module, context, {
    type: ServiceEventType.End,
    request
  });
};
