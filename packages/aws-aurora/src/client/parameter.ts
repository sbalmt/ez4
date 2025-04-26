import type { SqlParameter } from '@aws-sdk/client-rds-data';

import { detectFieldData } from './common/data.js';

/**
 * Sql parameter class.
 */
export abstract class Parameter {
  /**
   * Parameter data.
   */
  abstract data: SqlParameter;

  /**
   * Parameter name;
   */
  abstract name: string;

  /**
   * Determines whether or not the given value is a `Parameter` instance.
   *
   * @param value Value to check.
   */
  static isParameter(value: unknown): value is Parameter {
    return value instanceof Parameter;
  }

  /**
   * Make a new sql parameter.
   *
   * @param name Parameter name.
   * @param value Parameter value.
   * @returns Returns the parameter class.
   */
  static make(name: string, value: unknown) {
    const data = detectFieldData(name, value);

    return new (class extends Parameter {
      get name() {
        return name;
      }

      get data() {
        return data;
      }
    })();
  }
}
