import type { Environment, Service } from '@ez4/common';
import type { Factory } from '@ez4/factory';

export interface TestVariablesClient {
  read(): string;
}

export declare class TestVariablesDependency extends Factory.Service<TestVariablesClient> {
  handler: typeof createVariablesDependency;

  variables: {
    EZ4_FACTORY_DEPENDENCY: 'dependency';
  };

  services: {
    variables: Environment.ServiceVariables;
  };
}

export function createVariablesDependency({ variables }: Service.Context<TestVariablesDependency>): TestVariablesClient {
  return {
    read: () => variables.EZ4_FACTORY_DEPENDENCY
  };
}

export interface TestVariablesFirstClient extends TestVariablesClient {
  readAlias(): string;
  readDefault(): string;
  readDependency(): string;
}

export declare class TestVariablesFirst extends Factory.Service<TestVariablesFirstClient> {
  handler: typeof createVariablesFirst;

  variables: {
    EZ4_FACTORY_VALUE: 'first';
    EZ4_FACTORY_ALIAS: Environment.Variable<'PATH'>;
    EZ4_FACTORY_DEFAULT: Environment.VariableOrValue<'EZ4_FACTORY_UNSET_SOURCE', 'default-value'>;
  };

  services: {
    variables: Environment.ServiceVariables;
    dependency: Environment.Service<TestVariablesDependency>;
  };
}

export function createVariablesFirst({ variables, dependency }: Service.Context<TestVariablesFirst>): TestVariablesFirstClient {
  const alias = variables.EZ4_FACTORY_ALIAS;

  return {
    read: () => variables.EZ4_FACTORY_VALUE,
    readAlias: () => alias,
    readDefault: () => variables.EZ4_FACTORY_DEFAULT,
    readDependency: () => dependency.read()
  };
}

export declare class TestVariablesSecond extends Factory.Service<TestVariablesClient> {
  handler: typeof createVariablesSecond;

  variables: {
    EZ4_FACTORY_VALUE: 'second';
  };

  services: {
    variables: Environment.ServiceVariables;
  };
}

export function createVariablesSecond({ variables }: Service.Context<TestVariablesSecond>): TestVariablesClient {
  return {
    read: () => variables.EZ4_FACTORY_VALUE
  };
}

export declare class TestVariablesConflict extends Factory.Service<TestVariablesClient> {
  handler: typeof createVariablesConflict;

  variables: {
    EZ4_FACTORY_VALUE: 'conflict';
  };

  services: {
    first: Environment.Service<TestVariablesFirst>;
  };
}

export function createVariablesConflict({ first }: Service.Context<TestVariablesConflict>): TestVariablesClient {
  return first;
}
