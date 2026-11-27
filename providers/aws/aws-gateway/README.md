# EZ4: AWS Gateway

It provides all the components to manage API gateways on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-gateway -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Gateway child resources are removed through their dependency order. Routes,
integrations, responses, authorizers, and stages must be removed before the
gateway itself; stage access logging is detached during stage deletion.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## Contract

- [@ez4/gateway](../../../contracts/gateway/README.md)

## License

MIT License
