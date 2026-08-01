import type { Environment, Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';

type TestData = {};

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

function authorizerHandler(_request: TestData, { selfOptions, selfVariables }: Service.Context<TestService>): TestAuthResponse {
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
