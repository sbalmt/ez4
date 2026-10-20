import type { TestService } from '../cases/circular-dependencies';
import type { TestVariablesFirstClient } from '../cases/variables';

type ContextA = {
  serviceA: TestService;
};

export const invokeTestA = (_request: unknown, { serviceA }: ContextA) => {
  return serviceA.buildName();
};

type ContextB = {
  serviceB: TestService;
};

export const invokeTestB = (_request: unknown, { serviceB }: ContextB) => {
  return serviceB.buildName();
};

type ContextC = {
  testService: TestService;
};

export const invokeTestC = (_request: unknown, { testService }: ContextC) => {
  return testService.labelName();
};

export const invokeVariables = (_request: unknown, { factory }: { factory: TestVariablesFirstClient }) => ({
  value: factory.read(),
  alias: factory.readAlias(),
  fallback: factory.readDefault(),
  dependency: factory.readDependency()
});
