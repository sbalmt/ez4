# EZ4: AWS Queue

It provides all the components to manage simple queue services on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-queue -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Deleting an SQS queue is destructive: AWS removes the queue and any messages
still in it. Queue policies are managed as separate resources.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## Contract

- [@ez4/queue](../../../contracts/queue/README.md)

## License

MIT License
