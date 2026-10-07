import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule, ExecutionTimeoutError } from '@ez4/emulator';

const createTestModule = (handlerName: string) => {
  return createModule({
    environment: {
      timeout: 3,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    listener: {
      file: 'test/files/listener.ts',
      name: 'defaultListener',
      position: [1, 1]
    },
    manager: {
      file: 'test/files/manager.ts',
      name: 'makeDefaultManager'
    }
  });
};

describe('worker listener lifecycle', { timeout: 10000 }, () => {
  it('assert :: calls listener phases in order on the happy path', async (context) => {
    const stdout = context.mock.method(process.stdout, 'write');

    try {
      const result = await createTestModule('echo').invoke({ value: 'listener result' });

      deepEqual(result, { value: 'listener result' });

      const output = stdout.mock.calls.map(({ arguments: args }) => args[0].toString()).join('');
      const events = output.match(/^(?:Begin|Ready|Done|Timeout|Error|End) event\.$/gm) ?? [];

      deepEqual(events, ['Begin event.', 'Ready event.', 'Done event.', 'End event.']);
    } finally {
      stdout.mock.restore();
    }
  });

  it('assert :: calls listener phases in order on the timeout path', async (context) => {
    const stdout = context.mock.method(process.stdout, 'write');

    try {
      await rejects(createTestModule('timeout').invoke({}), ExecutionTimeoutError);

      const output = stdout.mock.calls.map(({ arguments: args }) => args[0].toString()).join('');
      const events = output.match(/^(?:Begin|Ready|Done|Timeout|Error|End) event\.$/gm) ?? [];

      deepEqual(events, ['Begin event.', 'Ready event.', 'Timeout event.']);
    } finally {
      stdout.mock.restore();
    }
  });

  it('assert :: calls listener phases in order on the error path', async (context) => {
    const stdout = context.mock.method(process.stdout, 'write');

    try {
      await rejects(createTestModule('exception').invoke({}), {
        message: 'Fixture handler failed'
      });

      const output = stdout.mock.calls.map(({ arguments: args }) => args[0].toString()).join('');
      const events = output.match(/^(?:Begin|Ready|Done|Timeout|Error|End) event\.$/gm) ?? [];

      deepEqual(events, ['Begin event.', 'Ready event.', 'Error event.', 'End event.']);
    } finally {
      stdout.mock.restore();
    }
  });
});
