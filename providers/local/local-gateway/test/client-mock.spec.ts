import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HttpTester } from '@ez4/local-gateway/test';
import { Http } from '@ez4/gateway';

declare class TestApi extends Http.Service {
  routes: [
    {
      name: 'testApi';
      path: 'GET /test/api';
      handler: (request: TestRequest) => TestResponse;
    }
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
        status: 404,
        body: 'Not found'
      }
    });

    const { status, body } = await client.testApi({
      body: {
        foo: 'foo'
      }
    });

    equal(body, 'Not found');
    equal(status, 404);
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

    equal(status, 200);

    deepEqual(body, {
      bar: 'bar'
    });
  });
});
