import type { Cdn } from '@ez4/distribution';

// @ts-expect-error Missing required defaultOrigin.
export declare class TestCdn extends Cdn.Service {}
