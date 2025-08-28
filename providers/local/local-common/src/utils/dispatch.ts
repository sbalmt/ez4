import type { EmulatorServiceClients } from '@ez4/project/library';
import type { VirtualModule } from '../emulators/module.js';

import { ServiceError, ServiceEventType } from '@ez4/common';
import { Logger } from '@ez4/project/library';

export const onBegin = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  return module.listener?.(
    {
      type: ServiceEventType.Begin,
      request
    },
    context
  );
};

export const onReady = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown) => {
  return module.listener?.(
    {
      type: ServiceEventType.Ready,
      request
    },
    context
  );
};

export const onError = (module: VirtualModule, context: EmulatorServiceClients | null | undefined, request: unknown, error: unknown) => {
  Logger.error(`${error}`);

  if (error instanceof ServiceError) {
    error.details?.forEach((detail) => Logger.error(`Details: ${detail}`));
  }

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
  return module.listener?.(
    {
      type: ServiceEventType.End,
      request
    },
    context
  );
};
