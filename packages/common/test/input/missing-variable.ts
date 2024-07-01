import type { Environment } from '@ez4/common';

export declare class VariableCommonTest {
  variables: {
    // TEST_ENV_ERROR is an undefined environment variable.
    TEST_VAR: Environment.Variable<'TEST_ENV_ERROR'>;
  };
}
