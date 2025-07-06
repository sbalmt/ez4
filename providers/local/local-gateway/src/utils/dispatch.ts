import type { VirtualModule } from '@ez4/local-common';
import type { Http } from '@ez4/gateway';

import { EmulatorServiceClients } from '@ez4/project/library';
import { ServiceEventType } from '@ez4/common';

export const onBegin = (
  module: VirtualModule,
  context: EmulatorServiceClients | null | undefined,
  request: Partial<Http.Incoming<Http.AuthRequest | Http.Request>>
) => {
  return module.listener?.(
    {
      type: ServiceEventType.Begin,
      request
    },
    context
  );
};

export const onReady = (
  module: VirtualModule,
  context: EmulatorServiceClients | null | undefined,
  request: Partial<Http.Incoming<Http.AuthRequest | Http.Request>>
) => {
  return module.listener?.(
    {
      type: ServiceEventType.Ready,
      request
    },
    context
  );
};

export const onError = (
  module: VirtualModule,
  context: EmulatorServiceClients | null | undefined,
  request: Partial<Http.Incoming<Http.AuthRequest | Http.Request>>,
  error: unknown
) => {
  return module.listener?.(
    {
      type: ServiceEventType.Error,
      request,
      error
    },
    context
  );
};

export const onEnd = (
  module: VirtualModule,
  context: EmulatorServiceClients | null | undefined,
  request: Partial<Http.Incoming<Http.AuthRequest | Http.Request>>
) => {
  return module.listener?.(
    {
      type: ServiceEventType.End,
      request
    },
    context
  );
};
