import type { AuthorizationType } from '../common/authorization';

/**
 * HTTP authorization configuration.
 */
export interface HttpAuthorization {
  /**
   * Determines the HTTP authorization type.
   * Default is: `AuthorizationType.Bearer`
   */
  readonly type?: AuthorizationType;

  /**
   * Determines the authorization header name.
   * Default is: `authorization`
   */
  readonly header?: string;

  /**
   * Determines the HTTP authorization value.
   */
  readonly value: string;
}
