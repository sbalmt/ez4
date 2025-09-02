import type { Environment } from '@ez4/common';

export declare class VariableCommonTest {
  variables: {
    TEST_VAR: 'test-var';
    TEST_ENV_VAR: Environment.Variable<'TEST_STRING'>;
  };
}
