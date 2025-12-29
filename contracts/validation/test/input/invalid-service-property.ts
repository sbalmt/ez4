import type { Validation } from '@ez4/validation';

export declare class TestService extends Validation.Service<string> {
  handler: typeof validate;

  // No extra property is allowed
  invalid_property: true;
}

export function validate() {}
