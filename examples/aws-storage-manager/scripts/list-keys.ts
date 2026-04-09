import { BucketRunner } from '@ez4/local-storage/run';

const storage = BucketRunner.getClient('FileStorage');

for await (const entry of storage.scan()) {
  console.log(`${entry.modifiedAt.toISOString()}: ${entry.key} (${entry.size} bytes)`);
}
