import type { Validation } from '@ez4/validation';

export declare class TestValidationA extends Validation.Service<string> {
  handler: typeof performValidation;
}

export declare class TestValidationB extends Validation.Service<string> {
  handler: typeof performValidation;
}

export function performValidation(_input: Validation.Input<unknown>) {}
