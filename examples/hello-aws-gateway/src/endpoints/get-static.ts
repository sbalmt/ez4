import type { Http } from '@ez4/gateway';

import { readFile } from 'node:fs/promises';

/**
 * Get static response example.
 */
declare class GetStaticResponse implements Http.Response {
  status: 200;

  body: {
    message?: string;
  };
}

/**
 * Handler for `get` requests.
 * @returns Outgoing response.
 */
export async function getStaticHandler(): Promise<GetStaticResponse> {
  const buffer = await readFile('files/static.json');
  const json = JSON.parse(buffer.toString());

  return {
    status: 200,
    body: {
      message: json.message
    }
  };
}
