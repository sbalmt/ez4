import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

/**
 * Example table schema.
 */
export declare class UserSchema implements Database.Schema {
  id: String.UUID;
  email: string;
  name: string;
  active: boolean;
  created_at: String.DateTime;
}
