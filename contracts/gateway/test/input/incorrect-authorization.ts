import type { Http } from '@ez4/gateway';

// Missing Http.Authorization inheritance.
declare class TestAuthorization {
  value: 'secret';
}

export declare class TestService extends Http.Service {
  routes: [];
}

export declare class TestImport extends Http.Import<TestService> {
  project: 'name from project in ez4.project.js';

  authorization: TestAuthorization;
}
