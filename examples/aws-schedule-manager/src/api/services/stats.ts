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
    options: Environment.ServiceOptions;
    variables: Environment.ServiceVariables;
    eventDb: Environment.Service<EventDb>;
  };

  options: {
    log?: true;
  };
}

export function createService(context: Service.Context<StatsServiceFactory>) {
  const { eventDb, variables, options } = context;

  return {
    countEvents: async () => {
      const count = await eventDb.events.count({});

      if (options.log) {
        console.log(`[${variables.LOGGER_NAME}]: Events created: ${count}`);
      }
    }
  };
}
