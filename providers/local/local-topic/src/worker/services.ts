import type { Client, Topic } from '@ez4/topic';
import type { EventSchema } from '@ez4/topic/utils';
import type { ProviderContext } from '@ez4/emulator';
import type { RemoteClientOptions } from '@ez4/local-topic/client';

import { createLocalClient, createRemoteClient } from '@ez4/local-topic/client';

export type LocalServiceOptions = {
  identifier: string;
  schema: EventSchema;
};

export const makeLocalService = <T extends Topic.Event = any>(options: LocalServiceOptions, context: ProviderContext) => {
  const { identifier, schema } = options;

  return (): Client<T> => createLocalClient<T>(identifier, schema, context);
};

export type RemoteServiceOptions = {
  resourceName: string;
  schema: EventSchema;
  clientOptions: RemoteClientOptions;
};

export const makeRemoteService = (options: RemoteServiceOptions) => {
  const { resourceName, schema, clientOptions } = options;

  return () => createRemoteClient(resourceName, schema, clientOptions);
};
