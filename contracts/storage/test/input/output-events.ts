import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof eventHandler;
      files: ['path/to/file-a.txt', 'path/to/file-b.json'];
    }>,
    Bucket.UseEvent<{
      path: 'others/';
      handler: typeof eventHandler;
      architecture: ArchitectureType.Arm;
      runtime: RuntimeType.Node24;
      logLevel: LogLevel.Warning;
      logRetention: 14;
      memory: 128;
      timeout: 5;
      debug: true;
    }>
  ];

  // Services to all events.
  services: {
    selfClient: Environment.Service<TestStorage>;
  };
}

/**
 * Test storage event.
 */
export async function eventHandler(_event: Bucket.ObjectEvent, _context: Service.Context<TestStorage>) {}
