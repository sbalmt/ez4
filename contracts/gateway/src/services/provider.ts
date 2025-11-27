import type { LinkedVariables } from '@ez4/project/library';

export interface HttpProvider {
  /**
   * Variables associated to the provider.
   */
  variables?: LinkedVariables;

  /**
   * All services associated to the provider.
   */
  services: Record<string, unknown>;
}
