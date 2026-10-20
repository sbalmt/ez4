import { strictEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { watchReflectionFromFiles } from '@ez4/reflection';

describe('reflection watch', () => {
  it('assert :: closes the program when the reflection readiness fails', async () => {
    const expectedError = new Error('Reflection callback failed');

    await rejects(
      watchReflectionFromFiles(['./test/types/number.ts'], {
        compilerEvents: {
          onReflectionReady: () => {
            throw expectedError;
          }
        }
      }),
      (error) => {
        strictEqual(error, expectedError);
        return true;
      }
    );
  });
});
