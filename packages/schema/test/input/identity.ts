import type { String } from '@ez4/schema';

/**
 * String type enriched with identity formats.
 */
export interface IdentityTestSchema {
  /**
   * String following an email format.
   */
  email: String.Email;

  /**
   * String following a UUID format.
   */
  uuid: String.UUID;
}
