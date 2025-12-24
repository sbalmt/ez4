import type { Factory } from '@ez4/factory';

export declare class TestFactory extends Factory.Service<void> {
  handler: typeof factory;
}

export function factory() {}
