import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestAuthorization implements Http.Authorization {
  value!: 'secret';
}

export declare class TestService extends Http.Service {
  routes: [];
}

export declare class TestImport extends Http.Import<TestService> {
  project: 'name from project in ez4.project.js';

  authorization: TestAuthorization;
}
