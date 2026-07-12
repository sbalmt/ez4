import type { Database } from '@ez4/database';

// @ts-expect-error Missing required database properties.
export declare class TestDatabase extends Database.Service {}
