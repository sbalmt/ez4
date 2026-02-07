# EZ4: Email

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect email components.

## Getting started

#### Install

```sh
npm install @ez4/email @ez4/aws-email -D
```

#### Create email

```ts
// file: email.ts
import type { Environment, Service } from '@ez4/common';
import type { Email } from '@ez4/email';

// MyEmail declaration
export declare class MyEmail extends Email.Service {
  domain: 'my-domain.com';
}
```

#### Use email

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { MyEmail } from './email';

// Any other handler that has injected MyEmail service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myEmail } = context;

  await myEmail.send({
    from: 'sender@my-domain.com',
    to: ['receiver@my-domain.com'],
    subject: 'Test email',
    body: {
      html: 'Test body'
    }
  });
}
```

## Email properties

#### Service

| Name   | Type   | Description                         |
| ------ | ------ | ----------------------------------- |
| domain | string | Domain to setup the email identity. |

## Examples

- [Get started with email](../../examples/hello-aws-email)

## Providers

- [AWS provider](../../providers/aws/aws-email)

## License

MIT License
