import type { Validation } from '@ez4/validation';

// @ts-expect-error Missing validation handler.
export declare class TestService extends Validation.Service<string> {}
