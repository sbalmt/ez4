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
  headers: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
  parameters: {
    bar: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
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
  identity: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
  headers: {
    bar: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
  parameters: {
    baz: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
  query: {
    qux: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
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
