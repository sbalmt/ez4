# EZ4: AWS Topic

It provides all the components to manage SNS topics on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-topic -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Subscriptions are removed before their SNS topic. Subscription changes are
replacement operations rather than in-place updates.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## Contract

- [@ez4/queue](../../../contracts/queue/README.md)
- [@ez4/topic](../../../contracts/topic/README.md)

## License

MIT License
