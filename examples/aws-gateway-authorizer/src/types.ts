import type { Http } from '@ez4/gateway';

/**
 * Authorization identity.
 */
export declare class Identity implements Http.Identity {
  userId: string;
}

/**
 * Authorizer response example.
 */
export declare class AuthorizerResponse implements Http.AuthResponse {
  identity?: Identity;
}

/**
 * General response example.
 */
export declare class GeneralResponse implements Http.Response {
  status: 200;

  body: {
    message: string;
  };
}
