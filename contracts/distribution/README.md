# EZ4: Distribution

The Distribution contract defines a CDN distribution service for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your origins, certificates, aliases, and fallback rules, then generates the infrastructure and runtime bindings required to serve static content globally.

## Getting started

#### Install

```sh
npm install @ez4/distribution @ez4/aws-cloudfront -D
```

#### Create a distribution

Here's a minimal example of a distribution with a default origin, certificate, and fallback rules.

```ts
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

With your distribution defined, EZ4 handles provisioning, certificate wiring, origin routing, and global delivery automatically according to your contract.

## Distribution properties

#### Service

| Name          | Type                   | Description                                                          |
| ------------- | ---------------------- | -------------------------------------------------------------------- |
| defaultIndex  | string                 | Default index file name.                                             |
| certificate   | Cdn.UseCertificate<>   | Custom certificate associated with the distribution.                 |
| fallbacks     | Cdn.UseFallback<>[]    | Fallback rules applied when an origin returns specific status codes. |
| defaultOrigin | Cdn.UseDefaultOrigin<> | Default origin for the distribution.                                 |
| origins       | Cdn.UseOrigin<>        | Distribution origins.                                                |
| aliases       | string[]               | List of CNAME aliases for the distribution.                          |
| disabled      | boolean                | Determines whether or not the distribution is disabled.              |

> Use type helpers for `origins`, `defaultOrigin`, `certificate` and `fallbacks` properties.

## Examples

- [Get started with CloudFront](../../examples/hello-aws-cloudfront)

## Providers

- [AWS provider](../../providers/aws/aws-cloudfront)

## License

MIT License
