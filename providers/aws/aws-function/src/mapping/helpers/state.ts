import type { LambdaClient } from '@aws-sdk/client-lambda';

import { GetEventSourceMappingCommand } from '@aws-sdk/client-lambda';
import { Wait } from '@ez4/utils';

export const waitForReadyState = async (client: LambdaClient, eventId: string) => {
  const readyState = new Set(['Enabled', 'Disabled']);

  await Wait.until(async () => {
    const state = await getMappingState(client, eventId);

    if (!readyState.has(state)) {
      return Wait.RetryAttempt;
    }

    return true;
  });
};

const getMappingState = async (client: LambdaClient, eventId: string) => {
  const response = await client.send(
    new GetEventSourceMappingCommand({
      UUID: eventId
    })
  );

  return response.State!;
};
