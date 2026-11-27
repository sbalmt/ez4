# EZ4: AWS Scheduler

It provides all the components to manage scheduled events on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-scheduler -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Schedules are removed before their schedule groups through dependency
ordering. Target roles and functions are managed as separate resources.

## Custom entrypoint

See [customizing the function entrypoint](docs/entrypoint.md).

## Contract

- [@ez4/scheduler](../../../contracts/scheduler/README.md)

## License

MIT License
