import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  cors: Http.UseCors<{
    allowOrigins: ['*'];

    // No extra property is allowed.
    invalid_property: true;
  }>;
}
