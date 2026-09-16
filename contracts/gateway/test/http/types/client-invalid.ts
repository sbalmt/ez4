import type { Http, HttpClient } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  client: HttpClient<TestService>;

  routes: [
    Http.UseRoute<{
      name: 'required';
      path: 'POST /required';
      handler: typeof requiredHandler;
    }>,
    Http.UseRoute<{
      name: 'optional';
      path: 'POST /optional';
      handler: typeof optionalHandler;
    }>
  ];
}

declare class RequiredRequest implements Http.Request {
  parameters: {
    id: string;
  };
  headers: {
    token: string;
  };
  query: {
    filter: string;
  };
  body: {
    name: string;
  };
}

declare class OptionalRequest implements Http.Request {
  parameters: {
    id?: string;
  };
  headers: {
    trace?: string;
  };
  query: {
    page?: number;
  };
  body: {
    note?: string;
  };
}

function requiredHandler(_request: RequiredRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function optionalHandler(_request: OptionalRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

declare const client: TestService['client'];

client.required({
  parameters: { id: 'id' },
  headers: { token: 'token' },
  query: { filter: 'filter' },
  body: { name: 'name' }
});

client.optional({
  parameters: {},
  headers: {},
  query: {},
  body: {}
});

// @ts-expect-error Required parameters must be supplied.
client.required({
  headers: { token: 'token' },
  query: { filter: 'filter' },
  body: { name: 'name' }
});

// @ts-expect-error Required headers must be supplied.
client.required({
  parameters: { id: 'id' },
  query: { filter: 'filter' },
  body: { name: 'name' }
});

// @ts-expect-error Required query must be supplied.
client.required({
  parameters: { id: 'id' },
  headers: { token: 'token' },
  body: { name: 'name' }
});

// @ts-expect-error Required body must be supplied.
client.required({
  parameters: { id: 'id' },
  headers: { token: 'token' },
  query: { filter: 'filter' }
});

client.required({
  parameters: {
    // @ts-expect-error Required fields must use their declared types.
    id: 123
  },
  headers: { token: 'token' },
  query: { filter: 'filter' },
  body: { name: 'name' }
});

// @ts-expect-error Unknown request fields are rejected.
client.optional({ unknown: true });
