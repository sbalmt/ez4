import type { LinkedVariables } from '@ez4/project/library';

export interface HttpProvider {
  /**
   * Variables associated to the provider.
   */
  readonly variables?: LinkedVariables;

  /**
   * All services associated to the provider.
   */
  readonly services: Record<string, unknown>;
}
