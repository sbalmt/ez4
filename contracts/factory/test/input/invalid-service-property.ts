import type { Factory } from '@ez4/factory';

export declare class TestService extends Factory.Service<string> {
  handler: typeof create;

  // No extra property is allowed.
  invalid_property: true;
}

export function create() {
  return 'hello world';
}
