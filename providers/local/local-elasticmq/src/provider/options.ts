import type { ServeOptions } from '@ez4/project/library';

import { LocalQueueOptionsNotFoundError } from './errors';

export { LocalQueueOptionsNotFoundError } from './errors';

export const getElasticMqOptions = (options: ServeOptions) => {
  const { localOptions, testOptions, test } = options;

  const queueOptions = test ? testOptions?.queue : localOptions?.queue;

  if (!queueOptions?.host || !queueOptions?.port) {
    throw new LocalQueueOptionsNotFoundError();
  }

  return {
    endpoint: `http://${queueOptions.host}:${queueOptions.port}`
  };
};
