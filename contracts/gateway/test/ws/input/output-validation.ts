import type { Ws } from '@ez4/gateway';
import type { Validation } from '@ez4/validation';
import type { TestValidationA, TestValidationB } from '../../common/validations';

export declare class TestService extends Ws.Service<{}> {
  connect: Ws.UseConnect<{
    authorizer: typeof authorizerHandler;
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

declare class TestAuthRequest implements Ws.AuthRequest {
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

declare class TestAuthResponse implements Ws.AuthResponse {
  identity: {
    foo: string;
  };
}

export function authorizerHandler(_request: TestAuthRequest): TestAuthResponse {
  return {
    identity: {
      foo: 'foo'
    }
  };
}

declare class TestEvent implements Ws.Event {
  identity: {
    foo: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
  headers: {
    bar: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
  query: {
    baz: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
}

export function connectHandler(_event: Ws.Incoming<TestEvent>) {}

export function disconnectHandler(_event: Ws.Incoming<TestEvent>) {}

declare class TestRequest implements Ws.Request {
  identity: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };
  body: {
    yay: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
}

export function messageHandler(_request: Ws.Incoming<TestRequest>) {}
