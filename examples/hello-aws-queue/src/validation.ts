import type { Validation } from '@ez4/validation';

/**
 * Example of custom validation contract.
 */
export declare class ValidationExample extends Validation.Service<string> {
  handler: typeof validate;
}

export async function validate(input: Validation.Input<string>) {
  if (input.value === 'foo') {
    throw new Error(`The 'foo' value isn't allowed.`);
  }
}
