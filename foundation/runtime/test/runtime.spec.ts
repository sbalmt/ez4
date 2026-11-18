import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Runtime } from '../src/services/runtime';

describe('runtime', () => {
  it('assert :: exposes project metadata', () => {
    equal(Runtime.getProjectBranch(), 'unknown');
    equal(Runtime.getProjectPrefix(), 'unknown');
    equal(Runtime.getProjectName(), 'unknown');
  });

  it('assert :: tracks cold start per invocation', () => {
    Runtime.initialize('unknown');

    equal(Runtime.isColdStart(), true);

    Runtime.setScope({
      traceId: 'first'
    });

    equal(Runtime.isColdStart(), true);

    Runtime.setScope({
      traceId: 'second'
    });

    equal(Runtime.isColdStart(), true);

    Runtime.initialize('unknown');

    equal(Runtime.isColdStart(), false);
  });

  it('assert :: exposes resource ID', () => {
    Runtime.initialize('arn:aws:lambda:us-east-1:123456789012:function:test');

    equal(Runtime.getResourceId(), 'arn:aws:lambda:us-east-1:123456789012:function:test');
  });
});
