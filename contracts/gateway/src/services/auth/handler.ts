import type { Service } from '@ez4/common';
import type { AuthIncoming } from './incoming';
import type { AuthResponse } from './response';
import type { AuthRequest } from './request';
import type { AuthProvider } from './provider';

/**
 * Authorization handler.
 */
export type AuthHandler<T extends AuthRequest> = (
  request: AuthIncoming<T> | T,
  context: Service.Context<AuthProvider>
) => Promise<AuthResponse> | AuthResponse;
