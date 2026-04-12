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

declare class TestAuthResponse implements Ws.AuthResponse {
  /**
   * Authorization identity.
   */
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
  /**
   * Authorization identity.
   */
  identity: {
    foo: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };

  /**
   * Request headers.
   */
  headers: {
    bar: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };

  /**
   * Query strings.
   */
  query: {
    baz: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
}

export function connectHandler(_event: Ws.Incoming<TestEvent>) {}

export function disconnectHandler(_event: Ws.Incoming<TestEvent>) {}

declare class TestRequest implements Ws.Request {
  /**
   * Authorization identity.
   */
  identity: {
    foo: string & Validation.Use<TestValidationB> & Validation.Use<TestValidationA>;
  };

  /**
   * Body payload.
   */
  body: {
    yay: string & Validation.Use<TestValidationA> & Validation.Use<TestValidationB>;
  };
}

export function messageHandler(_request: Ws.Incoming<TestRequest>) {}
