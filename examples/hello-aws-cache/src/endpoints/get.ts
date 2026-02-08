import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { String } from '@ez4/schema';
import type { ApiProvider } from '../provider';

import { HttpNotFoundError } from '@ez4/gateway';
import { isAnyString } from '@ez4/utils';

declare class GetDataRequest implements Http.Request {
  parameters: {
    key: String.Size<1, 10>;
  };
}

declare class GetDataResponse implements Http.Response {
  status: 200;
  body: {
    value: string;
  };
}

export async function getDataHandler(request: GetDataRequest, context: Service.Context<ApiProvider>): Promise<GetDataResponse> {
  const { key } = request.parameters;
  const { cacheService } = context;

  const value = await cacheService.get(key);

  if (!isAnyString(value)) {
    throw new HttpNotFoundError("The given key wasn't found.");
  }

  return {
    status: 200,
    body: {
      value
    }
  };
}
