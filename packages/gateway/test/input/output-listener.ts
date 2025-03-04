import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route listener.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      listener: typeof testWatcher;
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
