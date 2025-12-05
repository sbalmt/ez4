# EZ4: Distribution

It uses the power of [reflection](../../foundation/reflection/) to provide a contact that determines how to build and connect distribution components.

## Getting started

#### Install

```sh
npm install @ez4/distribution @ez4/aws-cloudfront -D
```

#### Create distribution

```ts
// file: site.ts
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

// MySite declaration
export declare class MySite extends Cdn.Service {
  defaultIndex: 'index.html';

  defaultOrigin: Cdn.UseDefaultOrigin<{
    bucket: Environment.Service<MySiteBucket>;
  }>;

  certificate: Cdn.UseCertificate<{
    domain: '*.my-site.tld';
  }>;

  aliases: ['home.my-site.tld'];

  fallbacks: [
    Cdn.UseFallback<{
      code: 404;
      location: '/index.html';
    }>
  ];
}
```

## Distribution properties

| Name          | Type                   | Description                                             |
| ------------- | ---------------------- | ------------------------------------------------------- |
| origins       | Cdn.UseOrigin<>        | Distribution origins.                                   |
| defaultOrigin | Cdn.UseDefaultOrigin<> | Default origin for the distribution results.            |
| certificate   | Cdn.UseCertificate<>   | Custom certificate associated to the distribution.      |
| defaultIndex  | string                 | Default index file name.                                |
| aliases       | string                 | List of CNAME aliases for the distribution.             |
| fallbacks     | string                 | Distribution fallbacks.                                 |
| disabled      | boolean                | Determines whether or not the distribution is disabled. |

> Use type helpers for `origins`, `defaultOrigin` and `certificate` properties.

## Examples

- [Get started with CloudFront](../../examples/hello-aws-cloudfront)

## Providers

- [AWS provider](../../providers/aws/aws-cloudfront)

## License

MIT License
