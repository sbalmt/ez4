import type { Client, Notification } from '@ez4/notification';

import { Tester } from '@ez4/project/library';

export namespace NotificationTester {
  export const getClient = <T extends Notification.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };
}
