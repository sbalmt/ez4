import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  cache: Http.UseCache<{
    authorizerTTL: 5;

    // No extra property is allowed
    invalid_property: true;
  }>;
}
