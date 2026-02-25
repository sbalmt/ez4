import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: Bucket.UseEvents<{
    path: 'uploads/*';
    handler: typeof eventHandler;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    logLevel: LogLevel.Warning;
    logRetention: 14;
    memory: 128;
    timeout: 5;
    variables: {
      TEST_VAR1: 'test-literal-value';
      TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
    };
  }>;

  // Services to all streams.
  services: {
    selfClient: Environment.Service<TestStorage>;
  };
}

/**
 * Test storage event.
 */
export async function eventHandler(_event: Bucket.Event, _context: Service.Context<TestStorage>) {}
