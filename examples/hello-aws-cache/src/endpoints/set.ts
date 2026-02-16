import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { String } from '@ez4/schema';
import type { ApiProvider } from '../provider';

declare class SetDataRequest implements Http.Request {
  body: {
    key: String.Size<1, 10>;
    value: String.Size<1, 100>;
  };
}

export async function setDataHandler(request: SetDataRequest, context: Service.Context<ApiProvider>): Promise<Http.SuccessEmptyResponse> {
  const { key, value } = request.body;
  const { cacheService } = context;

  await cacheService.set(key, value);

  return {
    status: 204
  };
}
