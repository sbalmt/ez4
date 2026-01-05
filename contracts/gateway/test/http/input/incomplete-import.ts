import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];
}

// @ts-expect-error No required properties defined.
export declare class TestImport extends Http.Import<TestService> {}
