import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  // @ts-expect-error No extra property is allowed.
  defaults: Http.UseDefaults<{
    invalid_property: true;
  }>;

  routes: [];
}
