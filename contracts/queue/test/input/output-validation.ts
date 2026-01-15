import type { Validation } from '@ez4/validation';
import type { Queue } from '@ez4/queue';
import type { TestValidationA, TestValidationB } from '../common/validations';

interface TestMessage extends Queue.Message {
  foo: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];
}

function testHandler(_request: Queue.Incoming<TestMessage>) {}
