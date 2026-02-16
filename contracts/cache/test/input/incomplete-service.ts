import type { Cache } from '@ez4/cache';

// @ts-expect-error Missing required cache engine.
export declare class TestCache extends Cache.Service {}
