import type { Factory } from '@ez4/factory';

interface TestService {}

// @ts-expect-error Missing factory handler.
export declare class TestServiceFactory extends Factory.Service<TestService> {}
