import type { CacheDriver } from './types';

import { RestCommandError } from './errors';
import { DRIVER_TIMEOUT } from './types';

type RestResponse = {
  result?: unknown;
  error?: string;
};

/**
 * Redis REST API driver, each command is a stateless HTTP request (`POST` with the command as a
 * JSON array and a bearer token).
 *
 * Values are sent and returned as plain strings, without any automatic (de)serialization, so the
 * client returns exactly what was stored.
 */
export const createRestDriver = (url: string, token: string): CacheDriver => {
  return {
    send: async (command) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(command.map(String)),
        signal: AbortSignal.timeout(DRIVER_TIMEOUT)
      });

      const payload = await readResponse(response);

      if (!response.ok || !payload || payload.error) {
        throw new RestCommandError(String(command[0]), payload?.error ?? `HTTP status ${response.status}`);
      }

      return payload.result;
    },
    dispose: () => {}
  };
};

const readResponse = async (response: Response): Promise<RestResponse | undefined> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};
