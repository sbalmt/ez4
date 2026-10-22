import type { ProviderContext } from '@ez4/emulator';
import type { MessageSchema } from '@ez4/queue/utils';
import type { Queue } from '@ez4/queue';

import type { RemoteClientOptions } from '@ez4/local-queue/client';

import { createLocalClient, createRemoteClient } from '@ez4/local-queue/client';

export type LocalServiceOptions = {
  identifier: string;
  schema: MessageSchema;
  delay: number;
};

export const makeLocalService = <T extends Queue.Message = any, U extends Queue.Mode = any>(
  options: LocalServiceOptions,
  context: ProviderContext
) => {
  const { identifier, schema, delay } = options;

  return () => createLocalClient<T, U>(identifier, schema, { delay }, context);
};

export type RemoteServiceOptions = {
  resourceName: string;
  schema: MessageSchema;
  clientOptions: RemoteClientOptions;
};

export const makeRemoteService = (options: RemoteServiceOptions) => {
  const { resourceName, schema, clientOptions } = options;

  return () => createRemoteClient(resourceName, schema, clientOptions);
};
