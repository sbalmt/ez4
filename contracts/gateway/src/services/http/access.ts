/**
 * HTTP access configuration.
 */
export interface HttpAccess {
  /**
   * Specifies the default number of days the access logs should be retained.
   *
   * - Applies to the gateway's log group.
   */
  readonly logRetention: number;
}
