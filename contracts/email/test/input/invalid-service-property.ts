import type { Email } from '@ez4/email';

export declare class TestEmail extends Email.Service {
  domain: 'test.ez4.dev';

  // No extra property is allowed.
  invalid_property: true;
}
