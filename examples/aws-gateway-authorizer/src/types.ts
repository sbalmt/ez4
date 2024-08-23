import type { Http } from '@ez4/gateway';

/**
 * Authorization identity.
 */
declare class Identity implements Http.Identity {
  userId: string;
}

/**
 * Header authorizer example.
 */
export declare class HeaderAuthorizer implements Http.AuthRequest {
  headers: {
    authorization: string;
  };
}

/**
 * Query authorizer example.
 */
export declare class QueryAuthorizer implements Http.AuthRequest {
  query: {
    apiKey: string;
  };
}

/**
 * Authorizer response example.
 */
export declare class AuthorizerResponse implements Http.AuthResponse {
  identity?: Identity;
}

/**
 * Public request example.
 */
export declare class PublicRequest implements Http.Request {}

/**
 * Private request example.
 */
export declare class PrivateRequest implements Http.Request {
  identity: Identity;
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
