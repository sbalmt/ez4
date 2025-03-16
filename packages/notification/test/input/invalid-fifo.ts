import type { Notification } from '@ez4/notification';

type TestMessage = {
  id: string;
  user: string;
};

// Concrete class is not allowed.
class TestFifoMode implements Notification.FifoMode<TestMessage> {
  groupId!: 'user';
  uniqueId!: 'id';
}

export declare class TestNotification extends Notification.Service<TestMessage> {
  schema: TestMessage;

  fifoMode: TestFifoMode;

  subscriptions: [];
}
