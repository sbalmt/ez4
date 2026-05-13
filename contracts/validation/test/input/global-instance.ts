import type { Validation } from '@ez4/validation';

export declare class TestServiceValidation extends Validation.Service<string> {
  handler: typeof testServiceInitializer;
}

export async function testServiceInitializer(_input: Validation.Input<string>) {
  // Do nothing
}
