import type { Environment } from '@ez4/common';

export declare class ValueCommonTest {
  booleanValue: Environment.VariableOrValue<'TEST_BOOLEAN', false>;
  defaultBoolean: Environment.VariableOrValue<'UNDEFINED_TEST_BOOLEAN', false>;

  numberValue: Environment.VariableOrValue<'TEST_NUMBER', -1>;
  defaultNumber: Environment.VariableOrValue<'UNDEFINED_TEST_NUMBER', -1>;

  stringValue: Environment.VariableOrValue<'TEST_STRING', 'default'>;
  defaultString: Environment.VariableOrValue<'UNDEFINED_TEST_STRING', 'default'>;
}
