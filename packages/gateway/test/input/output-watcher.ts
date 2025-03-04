import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route watcher.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      watcher: typeof testWatcher;
      handler: typeof testHandler;
    }
  ];
}

export function testWatcher(): void {}

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
