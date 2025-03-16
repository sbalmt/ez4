import type { Notification } from '@ez4/notification';

type TestMessage = {
  id: string;
  user: string;
};

// Missing Notification.FifoMode inheritance.
declare class TestFifoMode {
  groupId: 'user';
  uniqueId: 'id';
}

export declare class TestNotification1 extends Notification.Service<TestMessage> {
  schema: TestMessage;

  fifoMode: TestFifoMode;

  subscriptions: [];
}

export declare class TestNotification2 extends Notification.Service<TestMessage> {
  schema: TestMessage;

  // @ts-ignore Group Id doesn't exist in TestMessage.
  fifoMode: {
    groupId: 'wrong';
  };

  subscriptions: [];
}
