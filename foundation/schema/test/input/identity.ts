import type { String } from '@ez4/schema';

/**
 * Internal test description.
 *
 * @description String type enriched with identity formats.
 */
export interface IdentityTestSchema {
  /**
   * @description String following an email format.
   */
  email: String.Email;

  /**
   * @description String following a UUID format.
   */
  uuid: String.UUID;
}
