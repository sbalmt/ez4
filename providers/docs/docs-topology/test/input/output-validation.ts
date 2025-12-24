import type { Validation } from '@ez4/validation';

export declare class TestValidation extends Validation.Service<string> {
  handler: typeof validate;
}

export function validate() {}
