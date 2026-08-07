import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';
import type { Ws } from '@ez4/gateway';

declare class TestValidation extends Validation.Service<string> {
  handler: typeof performValidation;
}

function performValidation(_input: Validation.Input<unknown>) {}

declare class TestIdentity implements Ws.Identity {
  parameter: Validation.Use<TestValidation>;
}

type TestData = {
  identity: TestIdentity;
};

type TestAuth = {
  headers: {
    foo: Validation.Use<TestValidation>;
  };
};

export declare class TestService extends Ws.Service<TestData> {
  name: 'Test Service';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    authorizer: typeof authorizerHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler1;
  }>;

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestService>;
  };
}

declare class TestAuthResponse implements Ws.AuthResponse {
  identity: {};
}

function authorizerHandler(_request: TestAuth, { selfOptions, selfVariables }: Service.Context<TestService>): TestAuthResponse {
  selfVariables;
  selfOptions;

  return {
    identity: {}
  };
}

function connectHandler(_event: Ws.Incoming<TestData>, { selfOptions, selfVariables }: Service.Context<TestService>) {
  selfVariables;
  selfOptions;
}

function disconnectHandler(_event: Ws.Incoming<TestData>, { selfOptions, selfVariables }: Service.Context<TestService>) {
  selfVariables;
  selfOptions;
}

function messageHandler1(_event: Ws.Incoming<TestData>, { selfOptions, selfVariables }: Service.Context<TestService>) {
  selfVariables;
  selfOptions;
}
