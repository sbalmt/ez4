import { equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CronTester } from '@ez4/local-scheduler/test';
import { deepEqual } from 'node:assert';

type TestEvent = {
  foo: string;
  bar: number;
};

describe('local scheduler tests', () => {
  const defaultEvent = {
    date: new Date(),
    event: {
      foo: 'foo',
      bar: 123
    }
  };

  it('assert :: get event (not found)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron');

    const event = await client.getEvent('random');

    equal(client.getEvent.mock.callCount(), 1);

    deepEqual(event, undefined);
  });

  it('assert :: get event (from default)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      default: defaultEvent
    });

    const event = await client.getEvent('random');

    equal(client.getEvent.mock.callCount(), 1);

    deepEqual(event, defaultEvent);
  });

  it('assert :: get event (from events)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      events: {
        foo: defaultEvent
      }
    });

    const event = await client.getEvent('foo');

    equal(client.getEvent.mock.callCount(), 1);

    deepEqual(event, defaultEvent);
  });

  it('assert :: create event', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron');

    await client.createEvent('foo', defaultEvent);

    equal(client.createEvent.mock.callCount(), 1);

    const event = await client.getEvent('foo');

    deepEqual(event, defaultEvent);
  });

  it('assert :: update event (not found)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron');

    rejects(() => client.updateEvent('random', defaultEvent));

    equal(client.updateEvent.mock.callCount(), 1);
  });

  it('assert :: update event (from default)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      default: defaultEvent
    });

    const updatedEvent = {
      date: new Date(),
      event: {
        foo: 'bar',
        bar: 456
      }
    };

    await client.updateEvent('random', updatedEvent);

    equal(client.updateEvent.mock.callCount(), 1);

    const event = await client.getEvent('random');

    deepEqual(event, updatedEvent);
  });

  it('assert :: update event (from events)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      events: {
        foo: defaultEvent
      }
    });

    const updatedEvent = {
      date: new Date(),
      event: {
        foo: 'bar',
        bar: 456
      }
    };

    await client.updateEvent('foo', updatedEvent);

    equal(client.updateEvent.mock.callCount(), 1);

    const event = await client.getEvent('foo');

    deepEqual(event, updatedEvent);
  });

  it('assert :: delete event (not found)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron');

    const success = await client.deleteEvent('random');

    equal(client.deleteEvent.mock.callCount(), 1);
    equal(success, false);
  });

  it('assert :: delete event (from default)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      default: defaultEvent
    });

    const success = await client.deleteEvent('random');

    equal(client.deleteEvent.mock.callCount(), 1);
    equal(success, true);

    const event = await client.getEvent('random');

    deepEqual(event, defaultEvent);
  });

  it('assert :: delete event (from events)', async () => {
    const client = CronTester.getClientMock<TestEvent>('cron', {
      events: {
        foo: defaultEvent
      }
    });

    const success = await client.deleteEvent('foo');

    equal(client.deleteEvent.mock.callCount(), 1);
    equal(success, true);

    const event = await client.getEvent('foo');

    deepEqual(event, undefined);
  });
});
