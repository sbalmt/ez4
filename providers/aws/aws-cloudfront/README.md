# EZ4: AWS CloudFront

It provides all the components to manage CloudFront distributions on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-cloudfront -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

CloudFront distributions are disabled before deletion because AWS only allows
disabled distributions to be removed. Functions, policies, origins, and
access controls are managed as separate resources.

## License

MIT License
