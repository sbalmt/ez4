import type { Environment } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  globalName: 'global-bucket-name';

  localPath: './public';

  autoExpireDays: 30;

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
