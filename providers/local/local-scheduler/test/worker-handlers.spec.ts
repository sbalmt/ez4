import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { after, before, describe, it, mock } from 'node:test';

import { notifyHttpRequest } from '@ez4/server';
import { createModule } from '@ez4/emulator';
import { Logger } from '@ez4/logger';
import { SchemaType } from '@ez4/schema';

import { registerLocalService } from '../src/provider/local';
import { InMemoryScheduler } from '../src/service/scheduler';

const handler = (name: string) => ({
  file: 'test/files/handlers.ts',
  position: [1, 1] as [number, number],
  name
});

const serveOptions = {
  projectName: 'local-scheduler',
  prefix: 'ez4',
  serviceHost: 'localhost:3734',
  branchName: 'test',
  version: 1
} as unknown as ServeOptions;

describe('worker scheduler handlers', () => {
  const schema = {
    type: SchemaType.Object,
    properties: {
      foo: {
        type: SchemaType.String
      }
    }
  };

  const makeService = (handlerName: string) => {
    return {
      name: 'TestScheduler',
      expression: 'rate(1 minute)',
      variables: {},
      services: {
        scheduler: {
          reference: 'TestScheduler'
        }
      },
      schema,
      target: {
        handler: handler(handlerName),
        variables: {}
      }
    } as unknown as CronService;
  };

  const makeContext = (): EmulateServiceContext => {
    return {
      makeDescriptors: () => ({
        scheduler: emulator.exportDescriptor!()
      }),
      makeReferences: () => ({
        scheduler: 'scheduler'
      }),
      makeService: async () => undefined
    } as unknown as EmulateServiceContext;
  };

  const emulator = registerLocalService(makeService('processEvent'), serveOptions, makeContext());

  const invokeHandler = async (handlerName: string, event: AnyObject | null = { foo: 'default' }) => {
    const context = makeContext();

    const module = createModule<AnyObject>({
      handler: handler(handlerName),
      references: context.makeReferences({}),
      services: context.makeDescriptors({}),
      invoker: {
        name: 'makeInvoker',
        module: '@ez4/local-scheduler/worker',
        options: {
          schema
        }
      },
      environment: {
        memory: 192,
        timeout: 10,
        variables: {}
      }
    });

    return module.invoke({
      event
    });
  };

  before(() => emulator.bootstrapHandler!());
  after(() => emulator.shutdownHandler!());

  it('assert :: create and get event', async () => {
    const result = await invokeHandler('createAndGet', {
      foo: 'foo'
    });

    deepEqual(result, {
      isDate: true,
      event: {
        foo: 'foo'
      }
    });
  });

  it('assert :: delete event', async () => {
    const result = await invokeHandler('deleteTwice');

    deepEqual(result, [true, false]);
  });

  it('assert :: event not found error', async () => {
    const result = await invokeHandler('updateMissing');

    deepEqual(result, {
      name: 'EventNotFoundError',
      message: 'Event missing not found on scheduler TestScheduler.'
    });
  });

  it('assert :: event too old error', async () => {
    const result = await invokeHandler('createTooOld');

    deepEqual(result, {
      name: 'EventTooOldError',
      message: 'Event for scheduler TestScheduler is too old.'
    });
  });

  it('assert :: process scheduler event', async () => {
    const completed = Promise.withResolvers<void>();
    const successMock = mock.method(Logger, 'success', () => completed.resolve());

    try {
      const response = await notifyHttpRequest(emulator.identifier, {
        method: 'POST',
        path: '/',
        headers: {},
        query: {},
        body: Buffer.from(
          JSON.stringify({
            foo: 'bar'
          })
        )
      });

      equal(response?.status, 201);
      equal(InMemoryScheduler.getEvent('TestScheduler', 'processed'), undefined);
      await completed.promise;

      const event = InMemoryScheduler.getEvent('TestScheduler', 'processed');

      deepEqual(event?.event, {
        foo: 'bar'
      });
    } finally {
      successMock.mock.restore();
    }
  });

  it('assert :: rejects invalid events in the worker before the target runs', async () => {
    await rejects(invokeHandler('processEvent', {}), /Malformed scheduler event/);
    await rejects(invokeHandler('processEvent', null), /Malformed scheduler event/);
  });

  it('assert :: rejects invalid HTTP events before acknowledgement', async () => {
    const response = await notifyHttpRequest(emulator.identifier, {
      method: 'POST',
      path: '/',
      body: '{}'
    });

    equal(response?.status, 400);
  });
});
