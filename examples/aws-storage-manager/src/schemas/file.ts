import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

/**
 * File status.
 */
export const enum FileStatus {
  Pending = 'pending',
  Completed = 'completed'
}

/**
 * File table schema.
 */
export declare class FileSchema implements Database.Schema {
  /**
   * File Id.
   */
  id: String.UUID;

  /**
   * File status.
   */
  status: FileStatus;

  /**
   * File creation date.
   */
  created_at: String.DateTime;

  /**
   * File last update date.
   */
  updated_at: String.DateTime;
}
