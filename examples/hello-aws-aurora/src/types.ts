import type { Database } from '@ez4/database';
import type { String } from '@ez4/schema';

export const enum EnumType {
  A = 'a',
  B = 'b'
}

export type ObjectType = {
  foo: string;
};

/**
 * Table schema example.
 */
export declare class TableSchema implements Database.Schema {
  /**
   * Example of a numeric property.
   */
  id: number;

  /**
   * Example of a text property.
   */
  text: string;

  /**
   * Example of flag property.
   */
  bool: boolean;

  /**
   * Example of an enum property.
   */
  enum: EnumType;

  /**
   * Example of an object property.
   */
  object: ObjectType;

  /**
   * Example of a  property.
   */
  list: ObjectType[];

  /**
   * Example of a rich-type property (ISO date and time).
   */
  date: String.DateTime;
}
