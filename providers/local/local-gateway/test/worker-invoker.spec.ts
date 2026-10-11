import type { ModuleInvocation } from '@ez4/emulator';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HttpNotFoundError } from '@ez4/gateway';

import { makeInvoker, RequestType } from '../src/worker/invoker';

class CustomError extends Error {}

const makeInvocation = (handler: () => unknown) => {
  const phases: string[] = [];
  let reportedError: unknown;
  const invocation: ModuleInvocation = {
    request: {},
    context: {},
    begin: async () => {
      phases.push('begin');
    },
    ready: async () => {
      phases.push('ready');
    },
    invoke: async () => {
      phases.push('invoke');
      return handler();
    },
    done: async () => {
      phases.push('done');
    },
    error: async (error) => {
      phases.push('error');
      reportedError = error;
    },
    end: async () => {
      phases.push('end');
    }
  };

  return { invocation, phases, getReportedError: () => reportedError };
};

describe('gateway worker response mapping', () => {
  it('assert :: formats successful HTTP responses inside the invoker', async () => {
    const { invocation, phases } = makeInvocation(() => ({ status: 204 }));
    const invoke = makeInvoker({ type: RequestType.HttpRequest, response: { status: 204 } });

    deepEqual(await invoke(invocation), { status: 204, headers: {} });
    deepEqual(phases, ['begin', 'ready', 'invoke', 'done', 'end']);
  });

  it('assert :: preserves HTTP error context and the error lifecycle', async () => {
    const error = new HttpNotFoundError('Not found.', { resource: 'item' });
    const { invocation, phases, getReportedError } = makeInvocation(() => {
      throw error;
    });
    const invoke = makeInvoker({ type: RequestType.HttpRequest, response: { status: 204 } });

    deepEqual(await invoke(invocation), {
      status: 404,
      body: JSON.stringify({ type: 'error', message: 'Not found.', context: { resource: 'item' } }),
      headers: { 'content-type': 'application/json' }
    });
    equal(getReportedError(), error);
    deepEqual(phases, ['begin', 'ready', 'invoke', 'error', 'end']);
  });

  it('assert :: maps custom authorizer errors before leaving the worker', async () => {
    const { invocation } = makeInvocation(() => {
      throw new CustomError('Denied.');
    });
    const invoke = makeInvoker({ type: RequestType.HttpAuthorizer, httpErrors: { CustomError: 409 } });

    deepEqual(await invoke(invocation), {
      status: 409,
      body: JSON.stringify({ type: 'error', message: 'Denied.' }),
      headers: { 'content-type': 'application/json' }
    });
  });

  it('assert :: leaves successful authorizer identities distinguishable from errors', async () => {
    const { invocation } = makeInvocation(() => ({ identity: { user: 'test' } }));

    deepEqual(await makeInvoker({ type: RequestType.HttpAuthorizer })(invocation), {
      identity: { user: 'test' }
    });
  });

  it('assert :: maps WS errors to JSON while the original type is available', async () => {
    const { invocation, phases } = makeInvocation(() => {
      throw new HttpNotFoundError('Missing.', { resource: 'ws' });
    });

    equal(
      await makeInvoker({ type: RequestType.WsMessage })(invocation),
      JSON.stringify({ type: 'error', message: 'Missing.', context: { resource: 'ws' } })
    );
    deepEqual(phases, ['begin', 'ready', 'invoke', 'error', 'end']);
  });

  it('assert :: propagates unmapped errors after emitting error and end', async () => {
    const error = new CustomError('Unmapped.');
    const { invocation, phases } = makeInvocation(() => {
      throw error;
    });

    await rejects(makeInvoker({ type: RequestType.HttpRequest, response: { status: 204 } })(invocation), error);
    deepEqual(phases, ['begin', 'ready', 'invoke', 'error', 'end']);
  });
});
