import type { Http } from '@ez4/gateway';

// @ts-ignore Missing required service id.
export declare class TestService1 extends Http.Service {
  name: 'Test Service 1';

  routes: [];
}

// @ts-ignore Missing required service routes.
export declare class TestService2 extends Http.Service {
  id: 'ez4-test-service';

  name: 'Test Service 2';
}

// @ts-ignore Missing required service name.
export declare class TestService3 extends Http.Service {
  id: 'ez4-test-service';

  routes: [];
}
