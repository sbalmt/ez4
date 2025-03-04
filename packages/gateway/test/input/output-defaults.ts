import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    watcher: typeof testWatcher;
    timeout: 15;
    memory: 192;
  };
}

export function testWatcher() {}
