import type { Client, Cron } from '@ez4/scheduler';

import { Tester } from '@ez4/project/library';

export namespace CronTester {
  export const getClient = <T extends Cron.Event>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };
}
