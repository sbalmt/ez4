import { pathToFileURL } from 'node:url';
import { register } from 'node:module';

if (!import.meta.dirname) {
  console.error(`Something went wrong, ensure your node is v20+`);
  process.exit(1);
}

register('ts-node/esm', pathToFileURL('./'));
