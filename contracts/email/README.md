# EZ4: Email

The Email contract defines an email‑sending service for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your email configuration and domain settings, then generates the infrastructure and runtime bindings required to send emails.

## Getting started

#### Install

```sh
npm install @ez4/email @ez4/aws-email -D
```

#### Create an email service

Here's a minimal example of an email service using a custom domain.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Email } from '@ez4/email';

// MyEmail declaration
export declare class MyEmail extends Email.Service {
  domain: 'my-domain.com';
}
```

#### Use email

Any handler with access to the email service can send messages.

```ts
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

With your email service defined, EZ4 handles provisioning, identity setup, and runtime wiring automatically according to your contract.

## Email properties

#### Service

| Name   | Type   | Description                               |
| ------ | ------ | ----------------------------------------- |
| domain | string | Domain used to set up the email identity. |

## Examples

- [Get started with email](../../examples/hello-aws-email)

## Providers

- [AWS provider](../../providers/aws/aws-email)

## License

MIT License
