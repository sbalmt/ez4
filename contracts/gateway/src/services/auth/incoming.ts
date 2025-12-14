import type { AuthRequest } from './request';

/**
 * Incoming authorization.
 */
export type AuthIncoming<T extends AuthRequest> = T & {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;

  /**
   * Request timestamp.
   */
  readonly timestamp: Date;

  /**
   * Request method.
   */
  readonly method?: string;

  /**
   * Request path.
   */
  readonly path?: string;
};
