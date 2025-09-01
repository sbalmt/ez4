import type { TableMetadata } from '@ez4/database';
import type { AnyObject } from '@ez4/utils';
import type { PostgresEngine } from './engine';

/**
 * Internal table metadata.
 */
export type InternalTableMetadata = TableMetadata & {
  engine: PostgresEngine;
  schema: AnyObject;
};
