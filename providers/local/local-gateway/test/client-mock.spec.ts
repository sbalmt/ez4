import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HttpTester } from '@ez4/local-gateway/test';
import { Http, HttpBadRequestError, HttpInternalServerError } from '@ez4/gateway';

declare class TestApi extends Http.Service {
  routes: [
    Http.UseRoute<{
      name: 'testApi';
      path: 'GET /test/api';
      handler: (request: TestRequest) => TestResponse;
    }>
  ];
}

type TestRequest = {
  body: {
    foo: string;
  };
};

type TestResponse = {
  status: 200;
  body: {
    bar: string;
  };
};

describe('local gateway tests', () => {
  it('assert :: send request (default response)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: {
        status: 201,
        body: 'Default body'
      }
    });

    const { status, body } = await client.testApi({
      body: {
        foo: 'foo'
      }
    });

    equal(client.testApi.mock.callCount(), 1);

    equal(status, 201);

    deepEqual(body, 'Default body');
  });

  it('assert :: send request (default callback)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: async () => {
        return {
          status: 204
        };
      }
    });

    const { status, body } = await client.testApi({
      body: {
        foo: 'foo'
      }
    });

    equal(client.testApi.mock.callCount(), 1);

    equal(status, 204);

    deepEqual(body, undefined);
  });

  it('assert :: send request (default exception)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: async () => {
        throw new Error('Random Error Message.');
      }
    });

    await rejects(
      () =>
        client.testApi({
          body: {
            foo: 'foo'
          }
        }),
      HttpInternalServerError
    );

    equal(client.testApi.mock.callCount(), 1);
  });

  it('assert :: send request (operation response)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: {
        status: 204
      },
      operations: {
        testApi: {
          status: 200,
          body: {
            bar: 'bar'
          }
        }
      }
    });

    const { status, body } = await client.testApi({
      body: {
        foo: 'foo'
      }
    });

    equal(client.testApi.mock.callCount(), 1);

    equal(status, 200);

    deepEqual(body, {
      bar: 'bar'
    });
  });

  it('assert :: send request (operation callback)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: {
        status: 204
      },
      operations: {
        testApi: async () => {
          return {
            status: 200,
            body: {
              bar: 'bar'
            }
          };
        }
      }
    });

    const { status, body } = await client.testApi({
      body: {
        foo: 'foo'
      }
    });

    equal(client.testApi.mock.callCount(), 1);

    equal(status, 200);

    deepEqual(body, {
      bar: 'bar'
    });
  });

  it('assert :: send request (operation exception)', async () => {
    const client = HttpTester.getClientMock<TestApi>('http', {
      default: {
        status: 204
      },
      operations: {
        testApi: async () => {
          throw new HttpBadRequestError('Random Error Message.');
        }
      }
    });

    await rejects(
      () =>
        client.testApi({
          body: {
            foo: 'foo'
          }
        }),
      HttpBadRequestError
    );

    equal(client.testApi.mock.callCount(), 1);
  });
});
