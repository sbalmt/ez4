import type { Environment } from '@ez4/common';

export declare class ValueCommonTest {
  booleanValue: Environment.Value<'TEST_BOOLEAN', false>;
  defaultBoolean: Environment.Value<'UNDEFINED_TEST_BOOLEAN', false>;

  numberValue: Environment.Value<'TEST_NUMBER', -1>;
  defaultNumber: Environment.Value<'UNDEFINED_TEST_NUMBER', -1>;

  stringValue: Environment.Value<'TEST_STRING', 'default'>;
  defaultString: Environment.Value<'UNDEFINED_TEST_STRING', 'default'>;
}
