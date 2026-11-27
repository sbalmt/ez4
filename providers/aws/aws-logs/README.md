# EZ4: AWS Logs

It provides all the components to manage logs on AWS.

## Getting started

#### Install

```sh
npm install @ez4/aws-logs -D
```

#### Permissions

See the [required deployment permissions](docs/permission.md).

## Deletion behavior

Non-forced log group deletion is deferred while the newest log event is
younger than the configured retention period. The resource remains in state
and is checked again by a later deployment. A log group without retention is
only deleted automatically when it has no log events; use forced deletion to
delete it while events are still retained.

## License

MIT License
