import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal } from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { notifyHttpRequest } from '@ez4/server';
import { createModule } from '@ez4/emulator';

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
    type: 'object',
    properties: {
      foo: {
        type: 'string'
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

  const invokeHandler = async (handlerName: string, event: AnyObject | null = null) => {
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

    const event = InMemoryScheduler.getEvent('TestScheduler', 'processed');

    deepEqual(event?.event, {
      foo: 'bar'
    });
  });
});
