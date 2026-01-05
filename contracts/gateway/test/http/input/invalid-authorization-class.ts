import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];
}

// Concrete class is not allowed.
class TestAuthorization implements Http.Authorization {
  value!: 'secret';
}

export declare class TestImport extends Http.Import<TestService> {
  project: 'name from project in ez4.project.js';

  authorization: TestAuthorization;
}
