import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];
}

export declare class TestImport extends Http.Import<TestService> {
  project: 'name from project in ez4.project.js';

  authorization: Http.UseAuthorization<{
    value: 'secret';

    // No extra property is allowed.
    invalid_property: true;
  }>;
}
