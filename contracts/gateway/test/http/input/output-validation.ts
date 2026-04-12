import type { Http } from '@ez4/gateway';
import type { Validation } from '@ez4/validation';
import type { TestValidationA, TestValidationB } from '../../common/validations';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testRoute;
    }>
  ];
}

declare class TestAuthRequest implements Http.AuthRequest {
  /**
   * Request headers.
   */
  headers: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };

  /**
   * Path parameters.
   */
  parameters: {
    bar: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };

  /**
   * Query strings.
   */
  query: {
    baz: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity: {
    foo: string;
  };
}

declare class TestRequest implements Http.Request {
  /**
   * Authorization identity.
   */
  identity: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };

  /**
   * Request headers.
   */
  headers: {
    bar: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };

  /**
   * Path parameters.
   */
  parameters: {
    baz: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };

  /**
   * Query strings.
   */
  query: {
    qux: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };

  /**
   * Body payload.
   */
  body: {
    yay: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
}

export function testAuthorizer(_request: TestAuthRequest): TestAuthResponse {
  return {
    identity: {
      foo: 'foo'
    }
  };
}

export function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
