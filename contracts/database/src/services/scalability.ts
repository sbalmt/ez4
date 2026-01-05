/**
 * Database scalability configuration.
 */
export interface DatabaseScalability {
  /**
   * Minimum scalability threshold.
   */
  minCapacity: number;

  /**
   * Maximum scalability threshold.
   */
  maxCapacity: number;
}
