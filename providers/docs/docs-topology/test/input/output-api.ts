import type { Http, Ws } from '@ez4/gateway';

export declare class TestHttp extends Http.Service {
  routes: [];
}

export declare class TestWs extends Ws.Service<{}> {
  connect: Ws.UseConnect<{
    handler: typeof handler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof handler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof handler;
  }>;
}

export function handler() {}
