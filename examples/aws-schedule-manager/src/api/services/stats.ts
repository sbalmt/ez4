import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';
import type { EventDb } from '@/dynamo';

interface StatsService {
  countEvents: () => Promise<void>;
}

export declare class StatsServiceFactory extends Factory.Service<StatsService> {
  handler: typeof createService;

  variables: {
    LOGGER_NAME: Environment.Variable<'LOGGER_NAME'>;
  };

  services: {
    variables: Environment.ServiceVariables;
    eventDb: Environment.Service<EventDb>;
  };
}

export function createService(context: Service.Context<StatsServiceFactory>) {
  const { eventDb, variables } = context;

  return {
    countEvents: async () => {
      const count = await eventDb.events.count({});

      console.log(`[${variables.LOGGER_NAME}]: Events created: ${count}`);
    }
  };
}
