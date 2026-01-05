# EZ4: Quick Start

## Setup

NodeJS is required to run the project; It's recommended to install it via NVM as follows:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# To not restart the terminal
\. "$HOME/.nvm/nvm.sh"

nvm install 24
```

> For more details and options go to the [NodeJS official](https://nodejs.org/en/download) documentation.

The project will require a `package.json`, let's initialize it:

```sh
npm init
```

Now the primary dependencies can be installed:

```sh
npm install -D @ez4/project @types/node@24 typescript
```

Also, the `tsconfig.json` is required:

```sh
npx tsc --init
```

## Configuration

Open the `package.json` and edit the type and scripts as follows:

```json
{
  "type": "module",
  "scripts": {
    "deploy": "tsc && ez4 deploy",
    "destroy": "tsc && ez4 destroy",
    "serve": "tsc && ez4 serve",
    "test": "tsc && ez4 test"
  }
}
```

Edit the `tsconfig.json` and ensure the following settings:

```json
{
  "compilerOptions": {
    "target": "es2024",
    "moduleResolution": "bundler",
    "module": "preserve",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["./src"],
  "exclude": ["node_modules"]
}
```

Create the `ez4.project.js` file and add the following configuration:

```js
/**
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  projectName: 'hello',
  sourceFiles: ['./src/api.ts'],
  stateFile: {
    path: 'deploy-state',
    remote: true
  }
};
```

> For more options check the [configuration](./configuration.md) documentation.

## Code

Since a simple API will be created, let's install the packages to handle API gateways.

```sh
npm install -D @ez4/gateway @ez4/local-gateway
```

Create the `src/api.ts` file and add the following:

```ts
import type { Http } from '@ez4/gateway';

export declare class MyApi extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'POST /say';
      handler: typeof handleRoute;
    }>
  ];
}

declare class RouteRequest implements Http.Request {
  body: {
    say: string;
  };
}

declare class RouteResponse implements Http.Response {
  status: 200;
  body: {
    echo: string;
  };
}

export function handleRoute(request: RouteRequest): RouteResponse {
  const { say } = request.body;

  return {
    status: 200,
    body: {
      echo: say
    }
  };
}
```

Now let's serve the API:

```sh
npm run serve
```

And test it:

```sh
curl http://localhost:3734/ez4-hello-my-api/say -d '{"say":"hello world"}' -X POST
```

> The response should be: `{"echo":"hello world"}`

## Examples

- [Storage manager](../examples/aws-storage-manager)
- [Schedule manager](../examples/aws-schedule-manager)

## License

MIT License
