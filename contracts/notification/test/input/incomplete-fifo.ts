import type { Notification } from '@ez4/notification';

type TestMessage = {
  id: string;
  user: string;
};

export declare class TestNotification extends Notification.Service<TestMessage> {
  schema: TestMessage;

  // @ts-ignore Missing groupId field.
  fifoMode: {
    uniqueId: 'id';
  };

  subscriptions: [];
}
