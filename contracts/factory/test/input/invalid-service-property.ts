import type { Factory } from '@ez4/factory';

interface TestService {}

export declare class TestServiceFactory extends Factory.Service<TestService> {
  handler: typeof create;

  // No extra property is allowed.
  invalid_property: true;
}

export function create() {
  return {};
}
